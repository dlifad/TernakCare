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

class MarketplaceController extends Controller
{
    /**
     * Display the marketplace with filtered, sorted, and paginated products.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $filters = $request->only(['category', 'search', 'sort']);
        
        $products = Product::query()
            ->with('shop.user')
            ->where('is_active', 1)
            ->when(
                ($filters['category'] ?? null) && $filters['category'] !== 'all',
                fn($q) => $q->where('category', $filters['category'])
            )
            ->when($filters['search'] ?? null, fn($q, $search) => 
                $q->where('name', 'like', '%' . $search . '%')
            )
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

        return Inertia::render('Farmer/Marketplace/Index', [
            'products'   => $products,
            'categories' => $categories,
            'filters'    => $filters,
        ]);
    }

    /**
     * Display a specific product and its related products.
     *
     * @param  int  $id
     * @return \Inertia\Response
     */
    public function showProduct($id)
    {
        // Temukan produk berdasarkan ID dengan data toko dan user
        $product = Product::with(['shop.user', 'shop.bankAccount'])
            ->where('is_active', 1)
            ->findOrFail($id);

        // Temukan produk terkait berdasarkan kategori yang sama
        $relatedProducts = Product::where('category', $product->category)
            ->where('id', '!=', $product->id)
            ->where('is_active', 1)
            ->with('shop.user')
            ->limit(4)
            ->get();

        return Inertia::render('Farmer/Marketplace/Product', [
            'product'         => $product,
            'relatedProducts' => $relatedProducts,
        ]);
    }
    
    /**
     * Display checkout page for a product.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function checkout(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);
        
        $product = Product::with(['shop.user', 'shop.bankAccount'])
            ->where('is_active', 1)
            ->findOrFail($request->product_id);
            
        // Validasi stok
        if ($product->stock < $request->quantity) {
            return redirect()->back()->with('error', 'Stok produk tidak mencukupi');
        }
        
        $farmer = Auth::user()->farmer;
        
        return Inertia::render('Farmer/Marketplace/Checkout', [
            'product' => $product,
            'quantity' => $request->quantity,
            'farmer' => $farmer,
            'total' => $product->price * $request->quantity,
        ]);
    }
    
    /**
     * Process the order and create transaction records.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function processOrder(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'shipping_address' => 'required|string',
            'shipping_phone' => 'required|string',
            'payment_method' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        try {
            return DB::transaction(function () use ($request) {
                $product = Product::with('shop')->findOrFail($request->product_id);

                // Validasi stok
                if ($product->stock < $request->quantity) {
                    return redirect()->back()->with('error', 'Stok produk tidak mencukupi');
                }

                $farmer = Auth::user()->farmer;
                $subtotal = $product->price * $request->quantity;
                $transaction_code = 'TRX-' . strtoupper(Str::random(8));

                // Buat transaksi
                $transaction = Transaction::create([
                    'farmer_id' => $farmer->id,
                    'shop_id' => $product->shop->id,
                    'transaction_code' => $transaction_code,
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

                // Kurangi stok
                $product->decrement('stock', $request->quantity);

                // Kembalikan data transaksi dalam flash session
                return redirect()->route('farmer.payment.confirmation', $transaction->id)
                    ->with('success', 'Pesanan berhasil dibuat. Silakan lakukan pembayaran.')
                    ->with('transaction', $transaction);
            });
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan saat memproses pesanan. Silakan coba lagi: ' . $e->getMessage());
        }
    }


    /**
     * Menampilkan halaman konfirmasi pembayaran
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function paymentConfirmation(Transaction $transaction)
    {
        if ($transaction->farmer_id !== Auth::user()->farmer->id) {
            abort(403, 'Anda tidak memiliki akses ke transaksi ini');
        }

        $transaction->load(['items.product', 'shop.bankAccount', 'farmer.user']);

        return Inertia::render('Farmer/Marketplace/PaymentConfirmation', [
            'transaction' => $transaction,
        ]);
    }


    /**
     * Memproses konfirmasi pembayaran
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function processPaymentConfirmation(Request $request)
    {
        $request->validate([
            'transaction_id' => 'required|exists:transactions,id',
            'payment_proof' => 'required|image|max:2048', // Maksimal 2MB
        ]);
        
        $transaction = Transaction::findOrFail($request->transaction_id);
        
        // Periksa apakah transaksi milik petani yang sedang login
        if ($transaction->farmer_id !== Auth::user()->farmer->id) {
            abort(403, 'Anda tidak memiliki akses ke transaksi ini');
        }
        
        // Periksa apakah status transaksi masih pending
        if ($transaction->status !== 'pending') {
            return redirect()->back()->with('error', 'Transaksi ini tidak dapat dikonfirmasi karena status sudah berubah');
        }
        
        // Upload bukti pembayaran
        if ($request->hasFile('payment_proof')) {
            $path = $request->file('payment_proof')->store('payment_proofs', 'public');
        }
        
        // Update transaksi
        $transaction->update([
            'payment_proof' => $path ?? null,
            'status' => 'paid', // Ubah status menjadi dibayar
            'payment_date' => now(),
        ]);
        
        return redirect()->route('farmer.activity.index')
            ->with('success', 'Konfirmasi pembayaran berhasil dikirim. Pesanan Anda sedang diproses oleh penjual.');
    }
}

