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
        // Note: cartCount will be provided by middleware and doesn't need to be passed here
        return Inertia::render('Farmer/Marketplace/Cart', [
            'cartItems' => $cartItems,
            'itemsByShop' => $itemsByShop,
            'subtotal' => $subtotal,
        ]);
    }

    /**
     * Add a product to the cart.
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

        if (!$product->is_active) {
            return back()->with('error', 'Produk tidak tersedia.');
        }

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
            $newQuantity = $cartItem->quantity + $request->quantity;

            if ($newQuantity > $product->stock) {
                return back()->with('error', 'Total kuantitas melebihi stok yang tersedia.');
            }

            $cartItem->update(['quantity' => $newQuantity]);
        } else {
            $cart->items()->create([
                'product_id' => $product->id,
                'quantity' => $request->quantity,
            ]);
        }

        return back()->with('success', 'Produk berhasil ditambahkan ke keranjang.');
    }

    /**
     * Update cart item quantity.
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

        // Check if stock is sufficient
        if ($product->stock < $request->quantity) {
            return back()->with('error', 'Stok produk tidak mencukupi.');
        }

        $cartItem->update([
            'quantity' => $request->quantity
        ]);

        return back()->with('success', 'Keranjang berhasil diperbarui.');
    }

    /**
     * Remove an item from the cart.
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
        
        $cartItem->delete();

        return back()->with('success', 'Produk berhasil dihapus dari keranjang.');
    }

    /**
     * Clear all items from the cart.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function clear()
    {
        $cart = Cart::where('farmer_id', Auth::user()->farmer->id)->first();
        
        if ($cart) {
            // Delete all cart items
            $cart->items()->delete();
        }

        return back()->with('success', 'Keranjang berhasil dikosongkan.');
    }

    /**
     * Proceed to checkout.
     *
     * @return \Inertia\Response
     */
    public function checkout()
    {
        $user = Auth::user();
        $farmer = $user->farmer;

        // Ambil cart berdasarkan farmer
        $cart = Cart::where('farmer_id', $farmer->id)->first();

        if (!$cart) {
            return redirect()->route('farmer.marketplace')->with('error', 'Keranjang belanja Anda kosong.');
        }

        // Ambil item dari cart tersebut
        $cartItems = $cart->items()->with(['product.shop.user'])->get();

        if ($cartItems->isEmpty()) {
            return redirect()->route('farmer.marketplace')->with('error', 'Keranjang belanja Anda kosong.');
        }

        // Hitung total
        $cartTotal = $cartItems->sum(function ($item) {
            return $item->product->price * $item->quantity;
        });

        return Inertia::render('Farmer/Marketplace/Checkout', [
            'isFromCart' => true,
            'cartItems' => $cartItems,
            'cartTotal' => $cartTotal,
            'farmer' => $farmer,
        ]);
    }
}