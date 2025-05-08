<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Shop;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Display the shop's profile.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $shop = Auth::user()->shop->load('user');
        
        // Get shop statistics
        $statistics = [
            'totalProducts' => Product::where('shop_id', $shop->id)->count(),
            'activeProducts' => Product::where('shop_id', $shop->id)->where('status', 'available')->count(),
            
            // Transactions statistics
            'totalTransactions' => Transaction::whereHas('items', function ($q) use ($shop) {
                $q->whereHas('product', function ($p) use ($shop) {
                    $p->where('shop_id', $shop->id);
                });
            })->count(),
            
            'deliveredTransactions' => Transaction::whereHas('items', function ($q) use ($shop) {
                $q->whereHas('product', function ($p) use ($shop) {
                    $p->where('shop_id', $shop->id);
                });
            })->where('status', 'delivered')->count(),
        ];
        
        return Inertia::render('Shop/Profile/Index', [
            'shop' => $shop,
            'statistics' => $statistics
        ]);
    }

    /**
     * Show the form for editing the shop's profile.
     *
     * @return \Inertia\Response
     */
    public function edit()
    {
        $shop = Auth::user()->shop->load('user');
        
        return Inertia::render('Shop/Profile/Edit', [
            'shop' => $shop
        ]);
    }

    /**
     * Update the shop's profile.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request)
    {
        $shop = Auth::user()->shop;
        
        $request->validate([
            'shop_name' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'business_type' => 'required|string|max:100',
            'tax_id' => 'nullable|string|max:50',
            'phone' => 'required|string|max:20',
            'website' => 'nullable|url|max:255',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'country' => 'required|string|max:100',
            'logo' => 'nullable|image|max:2048', // Max 2MB
            
            // User fields
            'name' => 'required|string|max:255',
            'user_phone' => 'nullable|string|max:20',
        ]);
        
        // Update user information
        $shop->user->update([
            'name' => $request->name,
            'phone' => $request->user_phone,
        ]);
        
        // Handle logo upload
        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($shop->logo && Storage::disk('public')->exists($shop->logo)) {
                Storage::disk('public')->delete($shop->logo);
            }
            
            $path = $request->file('logo')->store('shop-logos', 'public');
            $shop->logo = $path;
        }
        
        // Update shop information
        $shop->update([
            'shop_name' => $request->shop_name,
            'description' => $request->description,
            'business_type' => $request->business_type,
            'tax_id' => $request->tax_id,
            'phone' => $request->phone,
            'website' => $request->website,
            'address' => $request->address,
            'city' => $request->city,
            'state' => $request->state,
            'postal_code' => $request->postal_code,
            'country' => $request->country,
        ]);
        
        return redirect()->route('shop.profile.index')->with('message', 'Shop profile updated successfully');
    }

    /**
     * Update shop's payment settings.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updatePaymentSettings(Request $request)
    {
        $shop = Auth::user()->shop;
        
        $request->validate([
            'bank_name' => 'nullable|string|max:255',
            'bank_account_name' => 'nullable|string|max:255',
            'bank_account_number' => 'nullable|string|max:50',
            'payment_methods' => 'nullable|array',
            'payment_methods.*' => 'string',
        ]);
        
        $shop->update([
            'bank_name' => $request->bank_name,
            'bank_account_name' => $request->bank_account_name,
            'bank_account_number' => $request->bank_account_number,
            'payment_methods' => $request->payment_methods ?? [],
        ]);
        
        return redirect()->route('shop.profile.index')->with('message', 'Payment settings updated successfully');
    }

    /**
     * Update shop's shipping settings.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateShippingSettings(Request $request)
    {
        $shop = Auth::user()->shop;
        
        $request->validate([
            'shipping_options' => 'nullable|array',
            'shipping_options.*' => 'string',
            'free_shipping_minimum' => 'nullable|numeric|min:0',
            'service_areas' => 'nullable|array',
            'service_areas.*' => 'string',
        ]);
        
        $shop->update([
            'shipping_options' => $request->shipping_options ?? [],
            'free_shipping_minimum' => $request->free_shipping_minimum,
            'service_areas' => $request->service_areas ?? [],
        ]);
        
        return redirect()->route('shop.profile.index')->with('message', 'Shipping settings updated successfully');
    }
}