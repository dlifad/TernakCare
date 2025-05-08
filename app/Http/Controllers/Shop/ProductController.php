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
    public function index(Request $request)
    {
        $user = Auth::user();

        if (!$user || !$user->shop) {
            return redirect()->route('register.shop')->with('error', 'Anda belum memiliki toko. Silakan daftar terlebih dahulu.');
        }

        $query = Product::where('shop_id', $user->shop->id);

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        $query->orderBy(
            $request->input('sort_field', 'created_at'),
            $request->input('sort_direction', 'desc')
        );

        $products = $query->paginate(12)->withQueryString();

        return Inertia::render('Shop/ManageProduct/Index', [
            'products' => $products,
            'filters' => $request->only(['search', 'category', 'sort_field', 'sort_direction']),
            'categories' => $this->getProductCategories()
        ]);
    }

    public function create()
    {
        return Inertia::render('Shop/ManageProduct/Create', [
            'categories' => $this->getProductCategories()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category' => 'required|string|max:100',
            'image' => 'required|image|max:2048',
            'status' => 'required|in:available,out_of_stock',
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|string|max:100',
        ]);

        $imagePath = $request->file('image')->store('product-images', 'public');

        Product::create(array_merge($request->only([
            'name', 'description', 'price', 'stock', 'category', 'status', 'weight', 'dimensions'
        ]), [
            'shop_id' => Auth::user()->shop->id,
            'image' => $imagePath
        ]));

        return redirect()->route('shop.manage-products.index')->with('message', 'Produk berhasil ditambahkan.');
    }

    public function edit(Product $product)
    {
        $this->authorizeProduct($product);

        return Inertia::render('Shop/ManageProduct/Edit', [
            'product' => $product,
            'categories' => $this->getProductCategories()
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $this->authorizeProduct($product);

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category' => 'required|string|max:100',
            'image' => 'nullable|image|max:2048',
            'status' => 'required|in:available,out_of_stock',
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|string|max:100',
        ]);

        if ($request->hasFile('image')) {
            if ($product->image && Storage::disk('public')->exists($product->image)) {
                Storage::disk('public')->delete($product->image);
            }
            $product->image = $request->file('image')->store('product-images', 'public');
        }

        $product->update($request->only([
            'name', 'description', 'price', 'stock', 'category', 'status', 'weight', 'dimensions'
        ]));

        return redirect()->route('shop.manage-products.index')->with('message', 'Produk berhasil diperbarui.');
    }

    public function destroy(Product $product)
    {
        $this->authorizeProduct($product);

        if ($product->image && Storage::disk('public')->exists($product->image)) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return redirect()->route('shop.manage-products.index')->with('message', 'Produk berhasil dihapus.');
    }

    public function updateStock(Request $request, Product $product)
    {
        $this->authorizeProduct($product);

        $request->validate([
            'stock' => 'required|integer|min:0',
        ]);

        $product->update([
            'stock' => $request->stock,
            'status' => $request->stock > 0 ? 'available' : 'out_of_stock',
        ]);

        return back()->with('message', 'Stok produk berhasil diperbarui.');
    }

    private function getProductCategories()
    {
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

    private function authorizeProduct(Product $product)
    {
        if ($product->shop_id !== Auth::user()->shop->id) {
            abort(403, 'Akses tidak diizinkan.');
        }
    }
}
