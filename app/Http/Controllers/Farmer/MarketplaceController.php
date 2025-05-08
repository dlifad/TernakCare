<?php

namespace App\Http\Controllers\Farmer;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Shop;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MarketplaceController extends Controller
{
    /**
     * Display the marketplace with products.
     */
    public function index(Request $request)
    {
        $query = Product::query()->with('shop.user')->where('status', 'active');

        // Apply filters
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Get products
        $products = $query->orderBy('created_at', 'desc')->paginate(12);

        // Get all categories for filter
        $categories = Product::distinct('category')->pluck('category');

        return Inertia::render('Farmer/Marketplace/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['category', 'search', 'min_price', 'max_price']),
        ]);
    }

    /**
     * Display a specific product.
     */
    public function showProduct($id)
    {
        $product = Product::with(['shop.user'])->findOrFail($id);
        
        // Get related products from the same category
        $relatedProducts = Product::where('category', $product->category)
            ->where('id', '!=', $product->id)
            ->take(4)
            ->get();

        return Inertia::render('Farmer/Marketplace/Product', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
        ]);
    }

    /**
     * Add a product to cart.
     */
    public function addToCart(Request $request, $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $product = Product::findOrFail($id);

        // Get or create cart session
        $cart = session()->get('cart', []);

        // Add or update product in cart
        if (isset($cart[$id])) {
            $cart[$id]['quantity'] += $request->quantity;
        } else {
            $cart[$id] = [
                'id' => $product->id,
                'name' => $product->name,
                'price' => $product->price,
                'quantity' => $request->quantity,
                'image' => $product->image,
                'shop_id' => $product->shop_id,
                'shop_name' => $product->shop->shop_name,
            ];
        }

        session()->put('cart', $cart);

        return back()->with('message', 'Product added to cart successfully.');
    }

    /**
     * Display the cart.
     */
    public function cart()
    {
        $cart = session()->get('cart', []);
        
        // Group cart items by shop
        $groupedCart = [];
        $total = 0;
        
        foreach ($cart as $item) {
            $shopId = $item['shop_id'];
            
            if (!isset($groupedCart[$shopId])) {
                $groupedCart[$shopId] = [
                    'shop_id' => $shopId,
                    'shop_name' => $item['shop_name'],
                    'items' => [],
                    'subtotal' => 0,
                ];
            }
            
            $groupedCart[$shopId]['items'][] = $item;
            $itemTotal = $item['price'] * $item['quantity'];
            $groupedCart[$shopId]['subtotal'] += $itemTotal;
            $total += $itemTotal;
        }

        return Inertia::render('Farmer/Marketplace/Cart', [
            'cart' => array_values($groupedCart),
            'total' => $total,
        ]);
    }

    /**
     * Update cart quantities.
     */
    public function updateCart(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $cart = session()->get('cart', []);

        foreach ($request->items as $item) {
            if (isset($cart[$item['id']])) {
                $cart[$item['id']]['quantity'] = $item['quantity'];
            }
        }

        session()->put('cart', $cart);

        return back()->with('message', 'Cart updated successfully.');
    }

    /**
     * Remove an item from cart.
     */
    public function removeFromCart($id)
    {
        $cart = session()->get('cart', []);

        if (isset($cart[$id])) {
            unset($cart[$id]);
            session()->put('cart', $cart);
        }

        return back()->with('message', 'Item removed from cart successfully.');
    }

    /**
     * Display checkout page.
     */
    public function checkout()
    {
        $cart = session()->get('cart', []);
        
        if (empty($cart)) {
            return redirect()->route('farmer.marketplace.cart')
                ->with('error', 'Your cart is empty.');
        }
        
        // Group by shop for checkout
        $groupedCart = [];
        $total = 0;
        
        foreach ($cart as $item) {
            $shopId = $item['shop_id'];
            
            if (!isset($groupedCart[$shopId])) {
                $groupedCart[$shopId] = [
                    'shop_id' => $shopId,
                    'shop_name' => $item['shop_name'],
                    'items' => [],
                    'subtotal' => 0,
                ];
            }
            
            $groupedCart[$shopId]['items'][] = $item;
            $itemTotal = $item['price'] * $item['quantity'];
            $groupedCart[$shopId]['subtotal'] += $itemTotal;
            $total += $itemTotal;
        }

        return Inertia::render('Farmer/Marketplace/Checkout', [
            'cart' => array_values($groupedCart),
            'total' => $total,
            'farmer' => Auth::user()->farmer,
        ]);
    }

    /**
     * Process the order.
     */
    public function placeOrder(Request $request)
    {
        $request->validate([
            'shipping_address' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'payment_method' => 'required|string|in:cod,bank_transfer,e-wallet',
        ]);

        $cart = session()->get('cart', []);
        
        if (empty($cart)) {
            return redirect()->route('farmer.marketplace.cart')
                ->with('error', 'Your cart is empty.');
        }

        // Group by shop
        $groupedCart = [];
        
        foreach ($cart as $item) {
            $shopId = $item['shop_id'];
            
            if (!isset($groupedCart[$shopId])) {
                $groupedCart[$shopId] = [
                    'shop_id' => $shopId,
                    'items' => [],
                    'subtotal' => 0,
                ];
            }
            
            $groupedCart[$shopId]['items'][] = $item;
            $itemTotal = $item['price'] * $item['quantity'];
            $groupedCart[$shopId]['subtotal'] += $itemTotal;
        }

        // Create transactions for each shop
        foreach ($groupedCart as $shopId => $shopOrder) {
            $transaction = Transaction::create([
                'farmer_id' => Auth::user()->farmer->id,
                'shop_id' => $shopId,
                'total_amount' => $shopOrder['subtotal'],
                'shipping_address' => $request->shipping_address,
                'phone' => $request->phone,
                'payment_method' => $request->payment_method,
                'status' => 'pending',
            ]);

            // Create transaction items
            foreach ($shopOrder['items'] as $item) {
                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $item['id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'subtotal' => $item['price'] * $item['quantity'],
                ]);
            }
        }

        // Clear cart
        session()->forget('cart');

        return redirect()->route('farmer.activity.index')
            ->with('message', 'Order placed successfully.');
    }

    /**
     * Display a list of shops.
     */
    public function shops()
    {
        $shops = Shop::whereHas('user', function ($query) {
            $query->where('status', 'active');
        })->with('user')
            ->withCount('products')
            ->paginate(12);

        return Inertia::render('Farmer/Marketplace/Shops', [
            'shops' => $shops,
        ]);
    }

    /**
     * Display a specific shop with its products.
     */
    public function showShop($id, Request $request)
    {
        $shop = Shop::with('user')->findOrFail($id);
        
        $query = Product::where('shop_id', $id)->where('status', 'active');

        // Apply filters
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Get shop products
        $products = $query->orderBy('created_at', 'desc')->paginate(12);

        // Get shop categories
        $categories = Product::where('shop_id', $id)
            ->distinct('category')
            ->pluck('category');

        return Inertia::render('Farmer/Marketplace/Shop', [
            'shop' => $shop,
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['category', 'search']),
        ]);
    }
}