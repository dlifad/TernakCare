<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\Farmer;
use App\Models\Shop;
use App\Models\User;
use App\Providers\RouteServiceProvider;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'required|in:doctor,shop,farmer',
        ]);

        $isActive = $request->role === 'farmer' ? true : false;

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'is_active' => $isActive,
        ]);

        // Create role-specific profile
        switch ($user->role) {
            case 'doctor':
                Doctor::create(['user_id' => $user->id]);
                break;
            case 'shop':
                Shop::create([
                    'user_id' => $user->id,
                    'shop_name' => $request->name . ' Shop'
                ]);
                break;
            case 'farmer':
                Farmer::create(['user_id' => $user->id]);
                break;
        }

        event(new Registered($user));

        Auth::login($user);

        if (!$user->is_active) {
            Auth::logout();
            return redirect()->route('login')
                ->with('status', 'Your account is pending approval. Please wait for admin confirmation.');
        }

        return redirect(RouteServiceProvider::HOME);
    }
}