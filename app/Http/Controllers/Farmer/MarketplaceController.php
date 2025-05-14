<?php

namespace App\Http\Controllers\Farmer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Midtrans\Snap;
use Midtrans\Config;

class MarketplaceController extends Controller
{
    public function __construct()
    {
        // Set Midtrans config
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production', false);
        Config::$isSanitized = true;
        Config::$is3ds = true;
    }

    public function index(Request $request)
    {
        $filters = $request->only(['category', 'search', 'sort']);

        $products = Product::query()
            ->with('shop.user')
            ->where('is_active', 1)
            ->when($filters['category'] ?? null, fn($q, $val) => $val !== 'all' ? $q->where('category', $val) : $q)
            ->when($filters['search'] ?? null, fn($q, $val) => $q->where('name', 'like', "%$val%"))
            ->when($filters['sort'] ?? null, function ($q, $sort) {
                return match ($sort) {
                    'oldest'     => $q->orderBy('created_at', 'asc'),
                    'price_low'  => $q->orderBy('price', 'asc'),
                    'price_high' => $q->orderBy('price', 'desc'),
                    default      => $q->orderBy('created_at', 'desc'),
                };
            }, fn($q) => $q->orderBy('created_at', 'desc'))
            ->paginate(12)
            ->withQueryString();

        $categories = Product::where('is_active', 1)
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category');

        return Inertia::render('Farmer/Marketplace/Index', compact('products', 'categories', 'filters'));
    }

    public function showProduct($id)
    {
        $product = Product::with(['shop.user', 'shop.bankAccount'])
            ->where('is_active', 1)
            ->findOrFail($id);

        $relatedProducts = Product::where('category', $product->category)
            ->where('id', '!=', $product->id)
            ->where('is_active', 1)
            ->with('shop.user')
            ->limit(4)
            ->get();

        return Inertia::render('Farmer/Marketplace/Product', compact('product', 'relatedProducts'));
    }

    public function checkout(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'required|integer|min:1',
        ]);

        $product = Product::with(['shop.user', 'shop.bankAccount'])
            ->where('is_active', 1)
            ->findOrFail($request->product_id);

        if ($product->stock < $request->quantity) {
            return back()->with('error', 'Stok produk tidak mencukupi');
        }

        $farmer = Auth::user()->farmer;
        $total = $product->price * $request->quantity;

        return Inertia::render('Farmer/Marketplace/Checkout', [
            'product'  => $product,
            'quantity' => $request->quantity,
            'farmer'   => $farmer,
            'total'    => $total,
        ]);
    }

    public function processOrder(Request $request)
    {
        $request->validate([
            'product_id'       => 'required|exists:products,id',
            'quantity'         => 'required|integer|min:1',
            'shipping_address' => 'required|string',
            'shipping_phone'   => 'required|string',
            'payment_method'   => 'required|string',
            'notes'            => 'nullable|string',
        ]);

        try {
            return DB::transaction(function () use ($request) {
                $product = Product::with('shop')->findOrFail($request->product_id);

                if ($product->stock < $request->quantity) {
                    return back()->with('error', 'Stok produk tidak mencukupi');
                }

                $farmer = Auth::user()->farmer;
                $subtotal = $product->price * $request->quantity;
                $transactionCode = 'TRX-' . strtoupper(Str::random(8));

                $transaction = Transaction::create([
                    'farmer_id'         => $farmer->id,
                    'shop_id'           => $product->shop->id,
                    'transaction_code'  => $transactionCode,
                    'total_amount'      => $subtotal,
                    'status'            => 'pending',
                    'shipping_address'  => $request->shipping_address,
                    'shipping_phone'    => $request->shipping_phone,
                    'notes'             => $request->notes,
                ]);

                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id'     => $product->id,
                    'quantity'       => $request->quantity,
                    'price'          => $product->price,
                    'subtotal'       => $subtotal,
                ]);

                $product->decrement('stock', $request->quantity);

                // Midtrans payload
                $midtransParams = [
                    'transaction_details' => [
                        'order_id'     => $transactionCode,
                        'gross_amount' => $subtotal,
                    ],
                    'customer_details' => [
                        'first_name' => $farmer->user->name,
                        'email'      => $farmer->user->email,
                        'phone'      => $request->shipping_phone,
                    ],
                ];

                $snapToken = Snap::getSnapToken($midtransParams);

                return redirect()->route('farmer.payment.confirmation', $transaction->id)
                    ->with('success', 'Pesanan berhasil dibuat.')
                    ->with('snap_token', $snapToken)
                    ->with('transaction', $transaction);
            });
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal memproses pesanan: ' . $e->getMessage());
        }
    }

    public function paymentConfirmation(Transaction $transaction)
    {
        if ($transaction->farmer_id !== Auth::user()->farmer->id) {
            abort(403, 'Akses ditolak');
        }

        $transaction->load(['items.product', 'shop.bankAccount', 'farmer.user']);

        return Inertia::render('Farmer/Marketplace/PaymentConfirmation', [
            'transaction' => $transaction,
            'snapToken'   => session('snap_token'),
        ]);
    }

    public function processPaymentConfirmation(Request $request)
    {
        $request->validate([
            'transaction_id' => 'required|exists:transactions,id',
            'payment_proof'  => 'required|image|max:2048',
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
                'status'        => 'paid',
                'payment_date'  => now(),
            ]);
        }

        return redirect()->route('farmer.activity.index')
            ->with('success', 'Pembayaran berhasil dikonfirmasi.');
    }
}
