<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of the products.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $user = Auth::user();
    
        if (!$user || !$user->shop) {
            // Redirect ke halaman pendaftaran toko atau halaman error
            return redirect()->route('register.shop')->with('error', 'Anda belum memiliki toko. Silakan daftar sebagai toko terlebih dahulu.');
        }
        
        $query = Product::where('shop_id', $user->shop->id);
        
        $query = Product::where('shop_id', Auth::user()->shop->id);
        
        // Search by name if provided
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }
        
        // Filter by category if provided
        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }
        
        // Sort products
        $sortField = $request->input('sort_field', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);
        
        $products = $query->paginate(12)->withQueryString();
        
        return Inertia::render('Shop/Products/Index', [
            'products' => $products,
            'filters' => $request->only(['search', 'category', 'sort_field', 'sort_direction']),
            'categories' => $this->getProductCategories()
        ]);
    }

    /**
     * Show the form for creating a new product.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        return Inertia::render('Shop/Products/Create', [
            'categories' => $this->getProductCategories()
        ]);
    }

    /**
     * Store a newly created product in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category' => 'required|string|max:100',
            'image' => 'required|image|max:2048', // Max 2MB
            'status' => 'required|in:available,out_of_stock',
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|string|max:100',
        ]);
        
        // Handle product image upload
        $imagePath = $request->file('image')->store('product-images', 'public');
        
        // Create product
        Product::create([
            'shop_id' => Auth::user()->shop->id,
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'stock' => $request->stock,
            'category' => $request->category,
            'image' => $imagePath,
            'status' => $request->status,
            'weight' => $request->weight,
            'dimensions' => $request->dimensions,
        ]);
        
        return redirect()->route('shop.products.index')->with('message', 'Product created successfully');
    }

    /**
     * Display the specified product.
     *
     * @param  \App\Models\Product  $product
     * @return \Inertia\Response
     */
    public function show(Product $product)
    {
        // Check if the product belongs to the authenticated shop
        if ($product->shop_id !== Auth::user()->shop->id) {
            abort(403, 'Unauthorized action.');
        }
        
        return Inertia::render('Shop/Products/Show', [
            'product' => $product
        ]);
    }

    /**
     * Show the form for editing the specified product.
     *
     * @param  \App\Models\Product  $product
     * @return \Inertia\Response
     */
    public function edit(Product $product)
    {
        // Check if the product belongs to the authenticated shop
        if ($product->shop_id !== Auth::user()->shop->id) {
            abort(403, 'Unauthorized action.');
        }
        
        return Inertia::render('Shop/Products/Edit', [
            'product' => $product,
            'categories' => $this->getProductCategories()
        ]);
    }

    /**
     * Update the specified product in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, Product $product)
    {
        // Check if the product belongs to the authenticated shop
        if ($product->shop_id !== Auth::user()->shop->id) {
            abort(403, 'Unauthorized action.');
        }
        
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category' => 'required|string|max:100',
            'image' => 'nullable|image|max:2048', // Max 2MB
            'status' => 'required|in:available,out_of_stock',
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|string|max:100',
        ]);
        
        // Handle product image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($product->image && Storage::disk('public')->exists($product->image)) {
                Storage::disk('public')->delete($product->image);
            }
            
            $imagePath = $request->file('image')->store('product-images', 'public');
            $product->image = $imagePath;
        }
        
        // Update product
        $product->update([
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'stock' => $request->stock,
            'category' => $request->category,
            'status' => $request->status,
            'weight' => $request->weight,
            'dimensions' => $request->dimensions,
        ]);
        
        return redirect()->route('shop.products.index')->with('message', 'Product updated successfully');
    }

    /**
     * Remove the specified product from storage.
     *
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Product $product)
    {
        // Check if the product belongs to the authenticated shop
        if ($product->shop_id !== Auth::user()->shop->id) {
            abort(403, 'Unauthorized action.');
        }
        
        // Delete product image if exists
        if ($product->image && Storage::disk('public')->exists($product->image)) {
            Storage::disk('public')->delete($product->image);
        }
        
        $product->delete();
        
        return redirect()->route('shop.products.index')->with('message', 'Product deleted successfully');
    }

    /**
     * Update product stock.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateStock(Request $request, Product $product)
    {
        // Check if the product belongs to the authenticated shop
        if ($product->shop_id !== Auth::user()->shop->id) {
            abort(403, 'Unauthorized action.');
        }
        
        $request->validate([
            'stock' => 'required|integer|min:0',
        ]);
        
        $product->update([
            'stock' => $request->stock,
            'status' => $request->stock > 0 ? 'available' : 'out_of_stock',
        ]);
        
        return back()->with('message', 'Product stock updated successfully');
    }

    /**
     * Get list of product categories.
     *
     * @return array
     */
    private function getProductCategories()
    {
        // This would typically come from a database table, but for simplicity,
        // we're using a hardcoded list of common livestock product categories
        return [
            'feed' => 'Feed & Nutrition',
            'medicine' => 'Medicine & Health',
            'equipment' => 'Equipment & Tools',
            'accessories' => 'Accessories',
            'supplements' => 'Supplements',
            'care' => 'Animal Care Products',
            'other' => 'Other',
        ];
    }
}