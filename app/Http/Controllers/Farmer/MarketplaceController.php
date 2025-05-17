<?php

namespace App\Http\Controllers\Farmer;

use App\Http\Controllers\Controller;
use App\Models\Cart;
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
            ->with(['shop.user', 'images'])
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

        // Get cart count
        $cartCount = 0;
        if (Auth::check() && Auth::user()->farmer) {
            $cartCount = Cart::where('farmer_id', Auth::user()->farmer->id)
                ->first()?->items()->count() ?? 0;
        }

        return Inertia::render('Farmer/Marketplace/Index', compact('products', 'categories', 'filters', 'cartCount'));
    }

    public function showProduct($id)
    {
        $product = Product::with(['shop.user', 'shop.bankAccount', 'images'])
            ->where('is_active', 1)
            ->findOrFail($id);

        $relatedProducts = Product::where('category', $product->category)
            ->where('id', '!=', $product->id)
            ->where('is_active', 1)
            ->with(['shop.user', 'images'])
            ->limit(4)
            ->get();

        // Check if product is in cart
        $inCart = false;
        $cartQuantity = 0;

        if (Auth::check() && Auth::user()->farmer) {
            $cartItem = Cart::where('farmer_id', Auth::user()->farmer->id)
                ->whereHas('items', function ($q) use ($product) {
                    $q->where('product_id', $product->id);
                })
                ->with(['items' => function ($q) use ($product) {
                    $q->where('product_id', $product->id);
                }])
                ->first();

            if ($cartItem && $cartItem->items->isNotEmpty()) {
                $inCart = true;
                $cartQuantity = $cartItem->items->first()->quantity;
            }
        }

        // Get cart count
        $cartCount = 0;
        if (Auth::check() && Auth::user()->farmer) {
            $cartCount = Cart::where('farmer_id', Auth::user()->farmer->id)
                ->first()?->items()->count() ?? 0;

        }

        return Inertia::render('Farmer/Marketplace/Product', compact(
            'product',
            'relatedProducts',
            'inCart',
            'cartQuantity',
            'cartCount'
        ));
    }

    public function checkout(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'required|integer|min:1',
        ]);

        $product = Product::with(['shop.user', 'shop.bankAccount', 'images'])
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

    public function addToCart(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'required|integer|min:1',
        ]);

        $farmer = Auth::user()->farmer;
        $product = Product::findOrFail($request->product_id);

        if (!$product->is_active) {
            return back()->with('error', 'Produk tidak tersedia.');
        }

        if ($product->stock < $request->quantity) {
            return back()->with('error', 'Stok produk tidak mencukupi.');
        }

        // Cari atau buat cart untuk farmer
        $cart = Cart::firstOrCreate([
            'farmer_id' => $farmer->id,
        ]);

        // Cek apakah produk sudah ada di dalam cart
        $cartItem = $cart->items()->where('product_id', $product->id)->first();

        if ($cartItem) {
            $newQuantity = $cartItem->quantity + $request->quantity;

            if ($newQuantity > $product->stock) {
                return back()->with('error', 'Total kuantitas melebihi stok yang tersedia.');
            }

            $cartItem->update([
                'quantity' => $newQuantity,
            ]);
        } else {
            $cart->items()->create([
                'product_id' => $product->id,
                'quantity'   => $request->quantity,
            ]);
        }

        return back()->with('success', 'Produk berhasil ditambahkan ke keranjang.');
    }
}
