<?php

namespace App\Http\Controllers\Farmer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\CartItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Midtrans\Snap;
use Midtrans\Config;

class CheckoutController extends Controller
{
    public function __construct()
    {
        // Set konfigurasi Midtrans
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production', false);
        Config::$isSanitized = true;
        Config::$is3ds = true;
    }

    /**
     * Tampilkan halaman checkout
     * Lokasi file: app/Http/Controllers/Farmer/CheckoutController.php
     */
    public function show(Request $request)
    {
        $farmer = Auth::user()->farmer;
        $isFromCart = $request->has('cart_ids');

        if ($isFromCart) {
            // Checkout dari cart
            $cartItemIds = explode(',', $request->cart_ids);
            $cartItems = CartItem::whereIn('id', $cartItemIds)
                ->with(['product.shop', 'cart'])
                ->get();

            // Validasi kepemilikan cart items
            foreach ($cartItems as $item) {
                if ($item->cart->farmer_id !== $farmer->id) {
                    return redirect()->route('farmer.cart.index')
                        ->with('error', 'Anda tidak memiliki akses ke item tersebut.');
                }
            }

            if ($cartItems->isEmpty()) {
                return redirect()->route('farmer.cart.index')
                    ->with('error', 'Keranjang belanja kosong.');
            }

            $total = $cartItems->sum(function($item) {
                return $item->product->price * $item->quantity;
            });

            return Inertia::render('Farmer/Marketplace/Checkout', [
                'isFromCart' => true,
                'cartItems' => $cartItems,
                'cartTotal' => $total,
                'farmer' => $farmer->load('user'),
            ]);
        } else {
            // Checkout produk tunggal
            $request->validate([
                'product_id' => 'required|exists:products,id',
                'quantity' => 'required|integer|min:1',
            ]);

            $product = Product::with('shop')->findOrFail($request->product_id);
            $quantity = $request->quantity;

            // Cek stok
            if ($product->stock < $quantity) {
                return redirect()->back()
                    ->with('error', 'Stok produk tidak mencukupi.');
            }

            $total = $product->price * $quantity;

            return Inertia::render('Farmer/Marketplace/Checkout', [
                'isFromCart' => false,
                'product' => $product,
                'quantity' => $quantity,
                'total' => $total,
                'farmer' => $farmer->load('user'),
            ]);
        }
    }

    /**
     * Proses checkout dan buat transaksi
     * Lokasi file: app/Http/Controllers/Farmer/CheckoutController.php
     */
    public function process(Request $request)
    {
        $request->validate([
            'shipping_address' => 'required|string',
            'shipping_phone' => 'required|string',
            'notes' => 'nullable|string',
            'is_from_cart' => 'required|boolean',
            // Validasi conditional
            'cart_ids' => 'required_if:is_from_cart,true|array',
            'cart_ids.*' => 'exists:cart_items,id',
            'product_id' => 'required_if:is_from_cart,false|exists:products,id',
            'quantity' => 'required_if:is_from_cart,false|integer|min:1',
        ]);

        try {
            return DB::transaction(function () use ($request) {
                $farmer = Auth::user()->farmer;
                $transactions = [];

                if ($request->is_from_cart) {
                    // Proses checkout dari cart
                    $transactions = $this->processCartCheckout($request, $farmer);
                } else {
                    // Proses checkout produk tunggal
                    $transactions = [$this->processSingleProductCheckout($request, $farmer)];
                }

                // Ambil transaksi pertama untuk redirect ke payment
                $mainTransaction = $transactions[0];

                // Generate Snap Token untuk transaksi utama
                $snapToken = $this->generateSnapToken($mainTransaction);

                // Redirect ke halaman pembayaran
                return Inertia::render('Farmer/Marketplace/PaymentPage', [
                    'snapToken' => $snapToken,
                    'transaction' => $mainTransaction->load(['items.product', 'shop']),
                    'orderId' => $mainTransaction->transaction_code,
                    'total' => $mainTransaction->total_amount,
                    'client_key' => config('midtrans.client_key'),
                ]);
            });
        } catch (\Exception $e) {
            Log::error('Error processing checkout: ' . $e->getMessage());
            return back()->withErrors([
                'checkout_error' => 'Gagal memproses checkout: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Proses checkout dari cart
     * Lokasi file: app/Http/Controllers/Farmer/CheckoutController.php
     */
    private function processCartCheckout(Request $request, $farmer)
    {
        $cartItems = CartItem::whereIn('id', $request->cart_ids)
            ->with(['product.shop'])
            ->get();

        // Group cart items by shop
        $itemsByShop = $cartItems->groupBy('product.shop_id');
        $transactions = [];

        foreach ($itemsByShop as $shopId => $items) {
            // Validasi stok untuk setiap item
            foreach ($items as $item) {
                if ($item->product->stock < $item->quantity) {
                    throw new \Exception("Stok '{$item->product->name}' tidak mencukupi.");
                }
            }

            // Hitung total per shop
            $totalAmount = $items->sum(function($item) {
                return $item->product->price * $item->quantity;
            });

            // Buat transaksi
            $transaction = Transaction::create([
                'farmer_id' => $farmer->id,
                'shop_id' => $shopId,
                'transaction_code' => 'TRX-' . strtoupper(Str::random(8)),
                'total_amount' => $totalAmount,
                'status' => 'pending',
                'shipping_address' => $request->shipping_address,
                'shipping_phone' => $request->shipping_phone,
                'notes' => $request->notes,
            ]);

            // Buat transaction items dan kurangi stok
            foreach ($items as $item) {
                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price' => $item->product->price,
                    'subtotal' => $item->product->price * $item->quantity,
                ]);

                // Kurangi stok
                $item->product->decrement('stock', $item->quantity);
            }

            $transactions[] = $transaction;
        }

        // Hapus cart items setelah berhasil
        CartItem::whereIn('id', $request->cart_ids)->delete();

        return $transactions;
    }

    /**
     * Proses checkout produk tunggal
     * Lokasi file: app/Http/Controllers/Farmer/CheckoutController.php
     */
    private function processSingleProductCheckout(Request $request, $farmer)
    {
        $product = Product::with('shop')->findOrFail($request->product_id);

        // Validasi stok
        if ($product->stock < $request->quantity) {
            throw new \Exception('Stok produk tidak mencukupi.');
        }

        $subtotal = $product->price * $request->quantity;

        // Buat transaksi
        $transaction = Transaction::create([
            'farmer_id' => $farmer->id,
            'shop_id' => $product->shop->id,
            'transaction_code' => 'TRX-' . strtoupper(Str::random(8)),
            'total_amount' => $subtotal,
            'status' => 'pending',
            'shipping_address' => $request->shipping_address,
            'shipping_phone' => $request->shipping_phone,
            'notes' => $request->notes,
        ]);

        // Buat transaction item
        TransactionItem::create([
            'transaction_id' => $transaction->id,
            'product_id' => $product->id,
            'quantity' => $request->quantity,
            'price' => $product->price,
            'subtotal' => $subtotal,
        ]);

        // Kurangi stok
        $product->decrement('stock', $request->quantity);

        return $transaction;
    }

    /**
     * Generate Snap Token untuk pembayaran
     * Lokasi file: app/Http/Controllers/Farmer/CheckoutController.php
     */
    private function generateSnapToken($transaction)
    {
        if (empty(config('midtrans.server_key'))) {
            throw new \Exception('Konfigurasi Midtrans belum diatur');
        }

        $transaction->load(['items.product', 'farmer.user']);

        // Siapkan item details untuk Midtrans
        $itemDetails = [];
        foreach ($transaction->items as $item) {
            $itemDetails[] = [
                'id' => $item->product->id,
                'price' => (int)$item->price,
                'quantity' => (int)$item->quantity,
                'name' => $item->product->name,
            ];
        }

        // Parameter untuk Midtrans
        $params = [
            'transaction_details' => [
                'order_id' => $transaction->transaction_code,
                'gross_amount' => (int)$transaction->total_amount,
            ],
            'customer_details' => [
                'first_name' => $transaction->farmer->user->name,
                'email' => $transaction->farmer->user->email,
                'phone' => $transaction->shipping_phone,
            ],
            'item_details' => $itemDetails
        ];

        $snapToken = Snap::getSnapToken($params);

        if (empty($snapToken)) {
            throw new \Exception('Gagal mendapatkan token pembayaran');
        }

        return $snapToken;
    }

    /**
     * Halaman sukses pembayaran
     * Lokasi file: app/Http/Controllers/Farmer/CheckoutController.php
     */
    public function paymentSuccess(Request $request)
    {
        $orderId = $request->order_id;

        $transaction = Transaction::where('transaction_code', $orderId)
            ->with(['items.product', 'shop'])
            ->first();

        if (!$transaction) {
            return redirect()->route('farmer.marketplace')
                ->with('error', 'Transaksi tidak ditemukan');
        }

        // Pastikan transaksi milik user yang sedang login
        if ($transaction->farmer_id !== Auth::user()->farmer->id) {
            return redirect()->route('farmer.marketplace')
                ->with('error', 'Akses ditolak');
        }

        return Inertia::render('Farmer/Marketplace/PaymentSuccess', [
            'transaction' => $transaction
        ]);
    }
}