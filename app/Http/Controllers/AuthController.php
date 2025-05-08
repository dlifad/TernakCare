<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Doctor;
use App\Models\Shop;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class AuthController extends Controller
{
    /**
     * Display the registration view for farmers.
     */
    public function createFarmer()
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Display the registration view for doctors.
     */
    public function createDoctor()
    {
        return Inertia::render('Auth/RegisterDoctor');
    }

    /**
     * Display the registration view for shops.
     */
    public function createShop()
    {
        return Inertia::render('Auth/RegisterShop');
    }

    /**
     * Handle an incoming farmer registration request.
     */
    public function storeFarmer(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'farmer',
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect()->route('farmer.dashboard');
    }

    /**
     * Handle an incoming doctor registration request.
     */
    public function storeDoctor(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'phone_number' => 'required|string|max:20',
            'license_number' => 'required|string|max:255|unique:doctors',
            'practice_address' => 'required|string|max:500',
            'years_experience' => 'required|integer|min:0',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'doctor',
        ]);

        Doctor::create([
            'user_id' => $user->id,
            'license_number' => $request->license_number,
            'practice_address' => $request->practice_address,
            'years_experience' => $request->years_experience,
            'phone_number' => $request->phone_number,
            'status' => 'pending', // Status default, menunggu verifikasi admin
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect()->route('doctor.dashboard');
    }

    /**
     * Handle an incoming shop registration request.
     */
    public function storeShop(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'owner_id_number' => 'required|string|max:20',
            'shop_name' => 'required|string|max:255',
            'shop_phone' => 'required|string|max:20',
            'shop_address' => 'required|string|max:500',
            'shop_description' => 'required|string|max:1000',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'shop',
        ]);

        Shop::create([
            'user_id' => $user->id,
            'shop_name' => $request->shop_name,
            'shop_phone' => $request->shop_phone,
            'shop_address' => $request->shop_address,
            'shop_description' => $request->shop_description,
            'owner_id_number' => $request->owner_id_number,
            'status' => 'pending', // Status default, menunggu verifikasi admin
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect()->route('shop.dashboard');
    }
}
