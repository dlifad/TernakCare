<?php

namespace App\Http\Controllers\Farmer;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Services\TransactionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Midtrans\Snap;
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
            'shipping_address' => 'required|string',
            'shipping_phone' => 'required|string',
            'payment_method' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        try {
            return DB::transaction(function () use ($request) {
                $farmer = Auth::user()->farmer;
                $cartItems = Cart::with('product.shop')
                    ->where('farmer_id', $farmer->id)
                    ->get();

                if ($cartItems->isEmpty()) {
                    return back()->with('error', 'Keranjang belanja kosong.');
                }

                // Group cart items by shop
                $itemsByShop = $cartItems->groupBy('product.shop_id');

                $transactions = [];

                // Create transaction for each shop
                foreach ($itemsByShop as $shopId => $items) {
                    $totalAmount = $items->sum(function ($item) {
                        return $item->product->price * $item->quantity;
                    });

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

                    // Create transaction items
                    foreach ($items as $item) {
                        // Check stock availability
                        if ($item->product->stock < $item->quantity) {
                            throw new \Exception("Stok '{$item->product->name}' tidak mencukupi.");
                        }

                        TransactionItem::create([
                            'transaction_id' => $transaction->id,
                            'product_id' => $item->product_id,
                            'quantity' => $item->quantity,
                            'price' => $item->product->price,
                            'subtotal' => $item->product->price * $item->quantity,
                        ]);

                        // Decrement product stock
                        $item->product->decrement('stock', $item->quantity);
                    }

                    $transactions[] = $transaction;
                }

                // Generate Midtrans token for the first transaction
                // Note: In real world scenario, you might want to handle multiple transactions differently
                $mainTransaction = $transactions[0];
                $mainTransaction->load('items.product');

                $midtransParams = [
                    'transaction_details' => [
                        'order_id' => $mainTransaction->transaction_code,
                        'gross_amount' => $mainTransaction->total_amount,
                    ],
                    'customer_details' => [
                        'first_name' => $farmer->user->name,
                        'email' => $farmer->user->email,
                        'phone' => $request->shipping_phone,
                    ],
                    'item_details' => $mainTransaction->items->map(function ($item) {
                        return [
                            'id' => $item->product_id,
                            'price' => $item->price,
                            'quantity' => $item->quantity,
                            'name' => substr($item->product->name, 0, 50),
                        ];
                    })->toArray(),
                ];

                $snapToken = Snap::getSnapToken($midtransParams);

                // Clear the cart after successful transaction
                Cart::where('farmer_id', $farmer->id)->delete();

                return redirect()->route('farmer.payment.confirmation', $mainTransaction->id)
                    ->with('success', 'Pesanan berhasil dibuat.')
                    ->with('snap_token', $snapToken)
                    ->with('transaction', $mainTransaction)
                    ->with('has_multiple_transactions', count($transactions) > 1);
            });
        } catch (\Exception $e) {
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

        return Inertia::render('Farmer/Marketplace/PaymentConfirmation', [
            'transaction' => $transaction,
            'snapToken' => session('snap_token'),
            'hasMultipleTransactions' => session('has_multiple_transactions', false),
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
