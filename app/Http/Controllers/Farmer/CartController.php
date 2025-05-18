<?php

namespace App\Http\Controllers\Farmer;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class CartController extends Controller
{
    /**
     * Display the cart contents.
     * Lokasi file: app/Http/Controllers/Farmer/CartController.php
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        // Get cart for current farmer
        $cart = Cart::where('farmer_id', Auth::user()->farmer->id)->first();
        
        // Get cart items with their products and related data
        $cartItems = $cart ? $cart->items()->with(['product.shop.user', 'product.images'])->get() : collect([]);
        
        // Group cart items by shop
        $itemsByShop = $cartItems->groupBy('product.shop_id');
        
        // Calculate total price
        $subtotal = $cartItems->sum(function ($item) {
            return $item->product ? $item->product->price * $item->quantity : 0;
        });

        // Render page with data
        return Inertia::render('Farmer/Marketplace/Cart', [
            'cartItems' => $cartItems,
            'itemsByShop' => $itemsByShop,
            'subtotal' => $subtotal,
        ]);
    }

    /**
     * Add a product to the cart.
     * Lokasi file: app/Http/Controllers/Farmer/CartController.php
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $farmerId = Auth::user()->farmer->id;
        $product = Product::findOrFail($request->product_id);

        // Cek ketersediaan produk
        if (!$product->is_active) {
            return back()->with('error', 'Produk tidak tersedia.');
        }

        // Cek stok produk
        if ($product->stock < $request->quantity) {
            return back()->with('error', 'Stok produk tidak mencukupi.');
        }

        // Ambil atau buat cart berdasarkan farmer
        $cart = Cart::firstOrCreate([
            'farmer_id' => $farmerId
        ]);

        // Cek apakah produk sudah ada di cart_items
        $cartItem = $cart->items()->where('product_id', $product->id)->first();

        if ($cartItem) {
            // Update jumlah jika produk sudah ada di keranjang
            $newQuantity = $cartItem->quantity + $request->quantity;

            // Validasi stok lagi setelah penambahan
            if ($newQuantity > $product->stock) {
                return back()->with('error', 'Total kuantitas melebihi stok yang tersedia.');
            }

            $cartItem->update(['quantity' => $newQuantity]);
        } else {
            // Tambah item baru ke keranjang
            $cart->items()->create([
                'product_id' => $product->id,
                'quantity' => $request->quantity,
            ]);
        }

        return back()->with('success', 'Produk berhasil ditambahkan ke keranjang.');
    }

    /**
     * Update cart item quantity.
     * Lokasi file: app/Http/Controllers/Farmer/CartController.php
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = Cart::where('farmer_id', Auth::user()->farmer->id)->first();
        
        if (!$cart) {
            return back()->with('error', 'Keranjang tidak ditemukan.');
        }
        
        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('id', $id)
            ->firstOrFail();
        
        $product = Product::findOrFail($cartItem->product_id);

        // Cek ketersediaan stok
        if ($product->stock < $request->quantity) {
            return back()->with('error', 'Stok produk tidak mencukupi.');
        }

        // Update jumlah produk di keranjang
        $cartItem->update([
            'quantity' => $request->quantity
        ]);

        return back()->with('success', 'Keranjang berhasil diperbarui.');
    }

    /**
     * Remove an item from the cart.
     * Lokasi file: app/Http/Controllers/Farmer/CartController.php
     *
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function remove($id)
    {
        $cart = Cart::where('farmer_id', Auth::user()->farmer->id)->first();
        
        if (!$cart) {
            return back()->with('error', 'Keranjang tidak ditemukan.');
        }
        
        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('id', $id)
            ->firstOrFail();
        
        // Hapus item dari keranjang
        $cartItem->delete();

        return back()->with('success', 'Produk berhasil dihapus dari keranjang.');
    }

    /**
     * Clear all items from the cart.
     * Lokasi file: app/Http/Controllers/Farmer/CartController.php
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function clear()
    {
        $cart = Cart::where('farmer_id', Auth::user()->farmer->id)->first();
        
        if ($cart) {
            // Hapus semua item dari keranjang
            $cart->items()->delete();
        }

        return back()->with('success', 'Keranjang berhasil dikosongkan.');
    }

    /**
     * Proceed to checkout from cart.
     * Lokasi file: app/Http/Controllers/Farmer/CartController.php
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function checkout(Request $request)
    {
        $farmer = Auth::user()->farmer;

        // Ambil keranjang petani
        $cart = Cart::where('farmer_id', $farmer->id)->first();

        if (!$cart || $cart->items()->count() === 0) {
            return redirect()->route('farmer.marketplace')
                ->with('error', 'Keranjang belanja Anda kosong.');
        }

        // Dapatkan item yang akan di-checkout (semua atau yang dipilih)
        $cartItems = $cart->items()->with([
            'product.shop.user', 
            'product.images'
        ])->get();

        // Validasi stok untuk setiap item
        foreach ($cartItems as $item) {
            if ($item->product->stock < $item->quantity) {
                return redirect()->route('farmer.cart.index')
                    ->with('error', "Stok '{$item->product->name}' tidak mencukupi. Tersedia: {$item->product->stock}, diminta: {$item->quantity}");
            }
        }

        // Siapkan ID item yang akan di-checkout untuk diteruskan ke halaman checkout
        $cartItemIds = $cartItems->pluck('id')->join(',');

        // Redirect ke halaman checkout dengan ID item yang dipilih
        return redirect()->route('farmer.marketplace.checkout', [
            'cart_ids' => $cartItemIds
        ]);
    }
}