<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image;

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

        // Filter berdasarkan status aktif
        if ($request->filled('is_active')) {
            if ($request->is_active !== 'all') {
                $query->where('is_active', 
                    $request->is_active === 'active' || $request->is_active === 'true' ? 1 : 0
                );
            }
        }


        $query->orderBy(
            $request->input('sort_field', 'created_at'),
            $request->input('sort_direction', 'desc')
        );

        $products = $query->paginate(9)->withQueryString();

        return Inertia::render('Shop/ManageProduct/Index', [
            'products' => $products,
            'filters' => $request->only(['search', 'category', 'is_active', 'sort_field', 'sort_direction']),
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
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category' => 'required|string|in:Pakan Ternak,Obat & Vitamin,Peralatan',
            'image' => 'nullable|image|max:5120', // 5MB max
        ]);

        // Set default values
        $validated['shop_id'] = auth()->user()->shop->id;
        $validated['is_active'] = $request->stock > 0 ? true : false;
        $validated['featured'] = false;

        // Handle image upload
        if ($request->hasFile('image')) {
            $path = $this->storeImage($request->file('image'));
            $validated['image'] = $path;
        } else if ($request->has('image') && is_string($request->image) && Str::startsWith($request->image, 'data:image')) {
            // Handle base64 encoded image from the frontend
            $path = $this->storeBase64Image($request->image);
            $validated['image'] = $path;
        }

        $product = Product::create($validated);

        return redirect()->route('shop.manage-products.index')
            ->with('success', 'Produk berhasil disimpan.');
    }


    private function storeImage($image)
    {
        return $image->store('product-images', 'public');
    }

    // Add method if not exists
    private function storeBase64Image($base64Image)
    {
        // Extract the base64 content
        $image_parts = explode(";base64,", $base64Image);
        $image_type_aux = explode("image/", $image_parts[0]);
        $image_type = $image_type_aux[1];
        $image_base64 = base64_decode($image_parts[1]);
        $filename = 'product-images/' . uniqid() . '.' . $image_type;

        // Store the image
        Storage::disk('public')->put($filename, $image_base64);

        return $filename;
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

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category' => 'required|string|in:Pakan Ternak,Obat & Vitamin,Peralatan',
            'image' => 'nullable|image|max:5120', // Ubah max size sama dengan store
            'is_active' => 'nullable|boolean',
        ]);

        // Handle image update
        if ($request->hasFile('image')) {
            // Delete old image
            if ($product->image && Storage::disk('public')->exists($product->image)) {
                Storage::disk('public')->delete($product->image);
            }
            $validated['image'] = $request->file('image')->store('product-images', 'public');
        } else if ($request->has('image') && is_string($request->image) && Str::startsWith($request->image, 'data:image')) {
            // Handle base64 image
            if ($product->image && Storage::disk('public')->exists($product->image)) {
                Storage::disk('public')->delete($product->image);
            }
            $validated['image'] = $this->storeBase64Image($request->image);
        }

        // Remove image key if no new image
        if (!isset($validated['image'])) {
            unset($validated['image']);
        }

        // Update product
        $product->update(array_merge($validated, [
            'is_active' => $request->has('is_active') ? $request->is_active : ($request->stock > 0 ? 1 : 0),
        ]));

        return redirect()
            ->route('shop.manage-products.index')
            ->with('success', 'Produk berhasil diperbarui.');
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
            'is_active' => $request->stock > 0 ? 1 : 0,
        ]);

        return back()->with('message', 'Stok produk berhasil diperbarui.');
    }

    public function toggleActive(Request $request, Product $product)
    {
        $this->authorizeProduct($product);

        $product->update([
            'is_active' => !$product->is_active
        ]);

        return back()->with('message', $product->is_active ? 'Produk berhasil diaktifkan.' : 'Produk berhasil dinonaktifkan.');
    }

    private function getProductCategories()
    {
        return [
            'Pakan Ternak' => 'Pakan Ternak',
            'Obat & Vitamin' => 'Obat & Vitamin',
            'Peralatan' => 'Peralatan',
        ];
    }

    private function authorizeProduct(Product $product)
    {
        if ($product->shop_id !== Auth::user()->shop->id) {
            abort(403, 'Akses tidak diizinkan.');
        }
    }
}
