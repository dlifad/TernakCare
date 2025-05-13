<?php

namespace App\Http\Controllers\Shop;
use App\Http\Controllers\Controller;
use App\Models\Shop;
use App\Models\BankAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Menampilkan halaman profil toko
     */
    public function show()
    {
        $user = Auth::user();
        $shop = Shop::with('bankAccount')->where('user_id', $user->id)->first();

        // Jika toko belum ada, mungkin buat entri kosong atau redirect
        if (!$shop) {
            // Opsi 1: Redirect ke halaman pembuatan toko
            // return redirect()->route('shop.create');
            
            // Opsi 2: Buat objek kosong untuk ditampilkan di view
            $shop = new Shop();
            $shop->bankAccount = new BankAccount();
        }

        // Siapkan data untuk dikirim ke view
        $shopData = [
            'shop_name' => $shop->shop_name,
            'owner_name' => $user->name,
            'email' => $user->email,
            'phone' => $shop->shop_phone ?? $user->phone,
            'address' => $shop->shop_address ?? $user->address,
            'description' => $shop->shop_description,
            'operating_hours' => is_array($shop->operating_hours) ? json_encode($shop->operating_hours) : $shop->operating_hours,
            'bank_name' => $shop->bankAccount->bank_name ?? '',
            'account_number' => $shop->bankAccount->account_number ?? '',
            'account_name' => $shop->bankAccount->account_name ?? '',
        ];

        return Inertia::render('Shop/Profile/Index', [
            'shop' => $shopData
        ]);
    }

    /**
     * Update profil toko
     */
    public function update(Request $request)
    {
        $request->validate([
            'shop_name' => 'required|string|max:255',
            'owner_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'description' => 'nullable|string',
            'operating_hours' => 'nullable|string|max:255',
            'bank_name' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:255',
            'account_name' => 'nullable|string|max:255',
        ]);

        $user = Auth::user();
        
        // Update user details
        $user->name = $request->owner_name;
        $user->email = $request->email;
        $user->phone = $request->phone;
        $user->address = $request->address;
        $user->save();

        // Update or create shop
        $shop = Shop::updateOrCreate(
            ['user_id' => $user->id],
            [
                'shop_name' => $request->shop_name,
                'shop_phone' => $request->phone,
                'shop_address' => $request->address,
                'shop_description' => $request->description,
                'operating_hours' => $request->operating_hours,
            ]
        );

        // Update or create bank account
        if ($request->bank_name || $request->account_number || $request->account_name) {
            BankAccount::updateOrCreate(
                ['shop_id' => $shop->id],
                [
                    'bank_name' => $request->bank_name,
                    'account_number' => $request->account_number,
                    'account_name' => $request->account_name,
                ]
            );
        }

        return redirect()->route('shop.profile')->with('success', 'Profil toko berhasil diperbarui');
    }

    /**
     * Update password
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = Auth::user();

        // Verifikasi password lama
        if (!Hash::check($request->current_password, $user->password)) {
            return back()->withErrors([
                'current_password' => 'Password saat ini tidak cocok'
            ]);
        }

        // Update password
        $user->password = Hash::make($request->password);
        $user->save();

        return redirect()->route('shop.profile')->with('success', 'Password berhasil diperbarui');
    }
}