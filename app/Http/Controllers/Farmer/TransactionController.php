<?php

namespace App\Http\Controllers\Farmer;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\CartItem;
use App\Services\TransactionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Midtrans\Snap;
use Illuminate\Support\Facades\Log;
use Midtrans\Config;

class TransactionController extends Controller
{
    protected $transactionService;

    public function __construct(TransactionService $transactionService)
    {
        $this->transactionService = $transactionService;

        // Set Midtrans config
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production', false);
        Config::$isSanitized = true;
        Config::$is3ds = true;
    }

    /**
     * Process order from the cart.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function processCartOrder(Request $request)
    {
        $request->validate([
            'cart_ids' => 'required|array',
            'cart_ids.*' => 'exists:cart_items,id',
            'shipping_address' => 'required|string',
            'shipping_phone' => 'required|string',
            'payment_method' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        try {
            return DB::transaction(function () use ($request) {
                $farmer = Auth::user()->farmer;

                $cartItems = CartItem::whereIn('id', $request->cart_ids)
                    ->with(['product.shop', 'cart'])
                    ->get();

                foreach ($cartItems as $item) {
                    if ($item->cart->farmer_id !== $farmer->id) {
                        throw new \Exception('Anda tidak memiliki akses ke item ini.');
                    }
                }

                if ($cartItems->isEmpty()) {
                    throw new \Exception('Keranjang belanja kosong.');
                }

                $itemsByShop = $cartItems->groupBy('product.shop_id');
                $transactions = [];

                foreach ($itemsByShop as $shopId => $items) {
                    foreach ($items as $item) {
                        if ($item->product->stock < $item->quantity) {
                            throw new \Exception("Stok '{$item->product->name}' tidak mencukupi.");
                        }
                    }

                    $totalAmount = $items->sum(fn($item) => $item->product->price * $item->quantity);
                    $transactionCode = 'TRX-' . strtoupper(Str::random(8));

                    $transaction = Transaction::create([
                        'farmer_id' => $farmer->id,
                        'shop_id' => $shopId,
                        'transaction_code' => $transactionCode,
                        'total_amount' => $totalAmount,
                        'status' => 'pending',
                        'shipping_address' => $request->shipping_address,
                        'shipping_phone' => $request->shipping_phone,
                        'notes' => $request->notes,
                    ]);

                    foreach ($items as $item) {
                        TransactionItem::create([
                            'transaction_id' => $transaction->id,
                            'product_id' => $item->product_id,
                            'quantity' => $item->quantity,
                            'price' => $item->product->price,
                            'subtotal' => $item->product->price * $item->quantity,
                        ]);

                        $item->product->decrement('stock', $item->quantity);
                    }

                    $transactions[] = $transaction;
                }

                // Hapus cart items
                CartItem::whereIn('id', $request->cart_ids)->delete();

                // Redirect ke halaman konfirmasi pembayaran (transaksi pertama saja)
                $mainTransaction = $transactions[0];

                return Inertia::location(route('farmer.transaction.paymentConfirmation', $mainTransaction->id));
            });
        } catch (\Exception $e) {
            Log::error('Error processing cart order: ' . $e->getMessage());
            return back()->with('error', 'Gagal memproses pesanan: ' . $e->getMessage());
        }
    }



    /**
     * Display the payment confirmation page.
     *
     * @param  \App\Models\Transaction  $transaction
     * @return \Inertia\Response
     */
    public function paymentConfirmation(Transaction $transaction)
    {
        if ($transaction->farmer_id !== Auth::user()->farmer->id) {
            abort(403, 'Akses ditolak');
        }

        $transaction->load(['items.product', 'shop.bankAccount', 'farmer.user']);
        

        return Inertia::render('Farmer/Marketplace/PaymentPage', [
            'transaction' => $transaction,
            'snapToken' => session('snap_token'),
            'hasMultipleTransactions' => session('has_multiple_transactions', false),
            'items' => $transaction->items, // kirim semua item
            'total' => $transaction->total_amount,
            'orderId' => $transaction->order_id,
            'transaction_id' => $transaction->id,
            'client_key' => config('midtrans.client_key'),
        ]);


    }


    /**
     * Process payment confirmation
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function processPaymentConfirmation(Request $request)
    {
        $request->validate([
            'transaction_id' => 'required|exists:transactions,id',
            'payment_proof' => 'required|image|max:2048',
        ]);

        $transaction = Transaction::findOrFail($request->transaction_id);

        if ($transaction->farmer_id !== Auth::user()->farmer->id) {
            abort(403, 'Anda tidak berhak mengakses transaksi ini');
        }

        if ($transaction->status !== 'pending') {
            return back()->with('error', 'Transaksi sudah tidak dalam status menunggu');
        }

        if ($request->hasFile('payment_proof')) {
            $path = $request->file('payment_proof')->store('payment_proofs', 'public');
            $transaction->update([
                'payment_proof' => $path,
                'status' => 'paid',
                'payment_date' => now(),
            ]);
        }

        return redirect()->route('farmer.activity.index')
            ->with('success', 'Pembayaran berhasil dikonfirmasi.');
    }
}
