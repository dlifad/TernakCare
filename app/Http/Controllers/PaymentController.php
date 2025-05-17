<?php

namespace App\Http\Controllers;

use Midtrans\Snap;
use Midtrans\Config;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Midtrans\Notification;
use App\Services\MidtransService;

class PaymentController extends Controller
{
    protected $midtransService;

    public function __construct(MidtransService $midtransService)
    {
        $this->midtransService = $midtransService;
        
        // Set konfigurasi Midtrans
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production', false);
        Config::$isSanitized = true;
        Config::$is3ds = true;
    }

    public function getSnapToken(Request $request)
    {
        try {
            // Validasi input
            $request->validate([
                'product_id' => 'required|exists:products,id',
                'quantity' => 'required|integer|min:1',
                'shipping_address' => 'required|string',
                'shipping_phone' => 'required|string',
                'notes' => 'nullable|string',
            ]);

            // Cek konfigurasi
            if (empty(config('midtrans.server_key'))) {
                Log::error('Midtrans server key not configured');
                return back()->withErrors([
                    'snap_error' => 'Konfigurasi pembayaran belum diatur'
                ]);
            }

            return DB::transaction(function () use ($request) {
                $product = Product::with('shop')->findOrFail($request->product_id);
                
                // Cek stok produk
                if ($product->stock < $request->quantity) {
                    return back()->with('error', 'Stok produk tidak mencukupi');
                }
                
                $farmer = Auth::user()->farmer;
                $subtotal = $product->price * $request->quantity;
                $transactionCode = 'TRX-' . strtoupper(Str::random(8));
                
                // Buat transaksi baru di database
                $transaction = Transaction::create([
                    'farmer_id' => $farmer->id,
                    'shop_id' => $product->shop->id,
                    'transaction_code' => $transactionCode,
                    'total_amount' => $subtotal,
                    'status' => 'pending',
                    'shipping_address' => $request->shipping_address,
                    'shipping_phone' => $request->shipping_phone,
                    'notes' => $request->notes,
                ]);
                
                // Buat item transaksi
                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $product->id,
                    'quantity' => $request->quantity,
                    'price' => $product->price,
                    'subtotal' => $subtotal,
                ]);
                
                // Kurangi stok produk
                $product->decrement('stock', $request->quantity);
                
                // Parameter untuk Midtrans
                $params = [
                    'transaction_details' => [
                        'order_id' => $transactionCode,
                        'gross_amount' => (int)$subtotal,
                    ],
                    'customer_details' => [
                        'first_name' => $farmer->user->name,
                        'email' => $farmer->user->email,
                        'phone' => $request->shipping_phone,
                    ],
                    'item_details' => [[
                        'id' => $product->id,
                        'price' => (int)$product->price,
                        'quantity' => (int)$request->quantity,
                        'name' => $product->name,
                    ]]
                ];
                
                // Dapatkan Snap Token tapi jangan auto-initialize
                $snapToken = Snap::getSnapToken($params);
                
                if (empty($snapToken)) {
                    throw new \Exception('Token pembayaran kosong');
                }
                
                // Perubahan: Tambahkan flag initial=true untuk menandakan halaman pertama kali dimuat
                // Render halaman pembayaran
                return Inertia::render('Farmer/Marketplace/PaymentPage', [
                    'snapToken' => $snapToken,
                    'product' => $product,
                    'quantity' => $request->quantity,
                    'total' => $subtotal,
                    'orderId' => $transactionCode,
                    'transaction_id' => $transaction->id,
                    'client_key' => config('midtrans.client_key'), // Tambahkan client key
                    'initial_load' => true, // Flag untuk menandakan halaman pertama kali dimuat
                ]);
            });
        } catch (\Exception $e) {
            Log::error('Gagal ambil snap token: ' . $e->getMessage());
            Log::error('Error trace: ' . $e->getTraceAsString());
            
            return back()->withErrors([
                'snap_error' => 'Gagal mendapatkan token pembayaran: ' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * Handle payment notification from Midtrans
     */
    public function handlePaymentNotification(Request $request)
    {
        try {
            // Catat semua data yang diterima untuk debugging
            Log::info('Midtrans notification raw data', ['data' => $request->all()]);
            
            // Konfigurasi Midtrans (pastikan ini dilakukan di awal)
            Config::$serverKey = config('midtrans.server_key');
            Config::$isProduction = config('midtrans.is_production', false);
            
            // Gunakan objek Notification dari Midtrans (lebih aman)
            $notification = new Notification();
            
            $orderId = $notification->order_id;
            $transactionStatus = $notification->transaction_status;
            $fraudStatus = $notification->fraud_status;
            
            Log::info('Midtrans notification processed', [
                'order_id' => $orderId,
                'status' => $transactionStatus,
                'fraud' => $fraudStatus
            ]);

            // Jika order_id dimulai dengan 'CONS-', maka ini adalah pembayaran konsultasi
            if (strpos($orderId, 'CONS-') === 0) {
                $this->midtransService->handleConsultationPaymentNotification((array)$notification);
            } else {
                // Proses untuk transaksi marketplace (TRX-)
                $this->handleMarketplacePaymentNotification((array)$notification);
            }

            // PENTING: Selalu kembalikan status 200 dan "OK"
            return response('OK', 200);
        } catch (\Exception $e) {
            // Log error tapi tetap kembalikan status 200!
            Log::error('Error handling Midtrans notification: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            // Tetap return 200 agar Midtrans tidak retry terus menerus
            return response('OK', 200);
        }
    }

    /**
     * Handle marketplace payment notification
     */
    private function handleMarketplacePaymentNotification($notification)
    {
        // Konversi notifikasi ke objek Notification jika diperlukan
        $orderId = $notification['order_id'] ?? null;
        $transactionStatus = $notification['transaction_status'] ?? null;
        $fraudStatus = $notification['fraud_status'] ?? null;
        
        Log::info('Marketplace Payment Callback', [
            'order_id' => $orderId,
            'status' => $transactionStatus,
            'fraud' => $fraudStatus
        ]);
        
        // Cari transaksi berdasarkan order ID
        $transaction = Transaction::where('transaction_code', $orderId)->first();
        
        if (!$transaction) {
            Log::error('Transaction not found: ' . $orderId);
            return;
        }
        
        // Update status transaksi berdasarkan status dari Midtrans
        if ($transactionStatus == 'capture') {
            if ($fraudStatus == 'challenge') {
                // Transaksi diragukan, tetap pending
                $transaction->update(['status' => 'pending']);
            } else if ($fraudStatus == 'accept') {
                // Transaksi berhasil
                $transaction->update([
                    'status' => 'paid',
                    'payment_date' => now(),
                ]);
            }
        } else if ($transactionStatus == 'settlement') {
            // Transaksi berhasil
            $transaction->update([
                'status' => 'paid',
                'payment_date' => now(),
            ]);
        } else if ($transactionStatus == 'cancel' || $transactionStatus == 'deny' || $transactionStatus == 'expire') {
            // Transaksi batal, ditolak, atau kadaluarsa
            $transaction->update([
                'status' => 'cancelled',
            ]);
            
            // Kembalikan stok produk
            $transaction->load('items');
            foreach ($transaction->items as $item) {
                $product = Product::find($item->product_id);
                if ($product) {
                    $product->increment('stock', $item->quantity);
                }
            }
        } else if ($transactionStatus == 'pending') {
            // Transaksi masih pending
            $transaction->update([
                'status' => 'pending',
            ]);
        }
    }
    
    /**
     * Legacy method for backward compatibility
     * This will be deprecated, use handlePaymentNotification instead
     */
    public function handlePaymentCallback(Request $request)
    {
        try {
            // Konfigurasi Midtrans
            Config::$serverKey = config('midtrans.server_key');
            Config::$isProduction = config('midtrans.is_production', false);
            
            // Buat instance notifikasi
            $notification = new Notification();
            
            // Ambil data notifikasi
            $transactionStatus = $notification->transaction_status;
            $fraudStatus = $notification->fraud_status;
            $orderId = $notification->order_id;
            
            Log::info('Midtrans Callback (Legacy)', [
                'order_id' => $orderId,
                'status' => $transactionStatus,
                'fraud' => $fraudStatus
            ]);
            
            // Cari transaksi berdasarkan order ID
            $transaction = Transaction::where('transaction_code', $orderId)->first();
            
            if (!$transaction) {
                return response()->json(['status' => 'error', 'message' => 'Transaksi tidak ditemukan'], 404);
            }
            
            // Update status transaksi berdasarkan status dari Midtrans
            if ($transactionStatus == 'capture') {
                if ($fraudStatus == 'challenge') {
                    // Transaksi diragukan, tetap pending
                    $transaction->update(['status' => 'pending']);
                } else if ($fraudStatus == 'accept') {
                    // Transaksi berhasil
                    $transaction->update([
                        'status' => 'paid',
                        'payment_date' => now(),
                    ]);
                }
            } else if ($transactionStatus == 'settlement') {
                // Transaksi berhasil
                $transaction->update([
                    'status' => 'paid',
                    'payment_date' => now(),
                ]);
            } else if ($transactionStatus == 'cancel' || $transactionStatus == 'deny' || $transactionStatus == 'expire') {
                // Transaksi batal, ditolak, atau kadaluarsa
                $transaction->update([
                    'status' => 'cancelled',
                ]);
                
                // Kembalikan stok produk
                $transaction->load('items');
                foreach ($transaction->items as $item) {
                    $product = Product::find($item->product_id);
                    if ($product) {
                        $product->increment('stock', $item->quantity);
                    }
                }
            } else if ($transactionStatus == 'pending') {
                // Transaksi masih pending
                $transaction->update([
                    'status' => 'pending',
                ]);
            }
            
            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            Log::error('Error in payment callback: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
    
    public function paymentSuccess(Request $request)
    {
        $orderId = $request->order_id;
        
        // Cari transaksi berdasarkan order ID
        $transaction = Transaction::where('transaction_code', $orderId)
            ->with(['items.product', 'shop'])
            ->first();
        
        if (!$transaction) {
            return redirect()->route('farmer.marketplace')
                ->with('error', 'Transaksi tidak ditemukan');
        }
        
        return Inertia::render('Farmer/Marketplace/PaymentSuccess', [
            'transaction' => $transaction
        ]);
    }
}