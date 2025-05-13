<?php

namespace App\Http\Controllers\Farmer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class MarketplaceController extends Controller
{
    /**
     * Display the marketplace with filtered, sorted, and paginated products.
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
            ->when($filters['search'] ?? null, fn($q, $search) => $q->where('name', 'like', '%' . $search . '%'))
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
        
        // Mendapatkan data produk
        $product = Product::with('shop')
            ->where('is_active', 1)
            ->findOrFail($request->product_id);
            
        // Validasi stok
        if ($product->stock < $request->quantity) {
            return redirect()->back()->with('error', 'Stok produk tidak mencukupi');
        }
        
        // Mendapatkan data petani yang login
        $farmer = Auth::user()->farmer;
        
        // Membuat kode transaksi unik
        $transaction_code = 'TRX-' . Str::upper(Str::random(8));
        
        // Hitung total harga
        $subtotal = $product->price * $request->quantity;
        
        // Buat transaksi baru
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
        
        // Kurangi stok produk
        $product->decrement('stock', $request->quantity);
        
        return redirect()->route('farmer.activity.index')->with('success', 'Pesanan berhasil dibuat. Silakan lakukan pembayaran untuk menyelesaikan pesanan.');
    }
}