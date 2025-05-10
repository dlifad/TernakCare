<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Doctor;
use App\Models\Shop;
use App\Notifications\AccountVerificationNotification;
use App\Notifications\AccountRejectedNotification;
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
            'is_active' => true,
            'is_approved' => true,
        ]);

        event(new Registered($user));

        Auth::login($user);

        // Redirect ke halaman verifikasi email dulu
        return redirect()->route('verification.notice');
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
            'is_active' => true,
            'is_approved' => false,
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

        // Redirect ke halaman verifikasi email dulu
        return redirect()->route('verification.notice');
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
            'is_active' => true,
            'is_approved' => false,
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

        // Redirect ke halaman verifikasi email dulu
        return redirect()->route('verification.notice');
    }

    /**
     * Display the email verification notice.
     */
    public function showVerificationNotice()
    {
        return Inertia::render('Auth/VerifyEmail');
    }

    /**
     * Mark the user's email address as verified.
     */
    public function verifyEmail(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);

        // Verifikasi hash
        if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            abort(403);
        }

        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        // Setelah email terverifikasi, arahkan ke halaman menunggu verifikasi admin
        if (($user->role === 'doctor' || $user->role === 'shop') && !$user->is_approved) {
            return redirect()->route('awaiting.verification', ['userType' => $user->role]);
        }

        return redirect('/dashboard');
    }

    /**
     * Resend the email verification notification.
     */
    public function resendVerificationEmail(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended('/dashboard');
        }

        $request->user()->sendEmailVerificationNotification();

        return back()->with('status', 'verification-link-sent');
    }

    /**
     * Display awaiting verification page.
     */
    public function awaitingVerification(Request $request)
    {
        $userType = $request->query('userType', '');

        // Pastikan email sudah diverifikasi
        if (!Auth::user() || Auth::user()->email_verified_at === null) {
            return redirect()->route('verification.notice');
        }

        return Inertia::render('Auth/AwaitingVerification', [
            'userType' => $userType
        ]);
    }

    /**
     * Show the login form.
     */
    public function showLoginForm()
    {
        return Inertia::render('Auth/Login');
    }

    /**
     * Handle an incoming authentication request.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $credentials = $request->only('email', 'password');

        // Coba autentikasi
        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            $user = Auth::user();

            // Jika email belum diverifikasi
            if ($user->email_verified_at === null) {
                Auth::logout();
                return back()->withErrors([
                    'email' => 'Email Anda belum diverifikasi. Silakan cek inbox email Anda untuk link verifikasi.',
                ])->withInput();
            }

            // Jika user dokter dengan status pending
            if ($user->role === 'doctor' && $user->doctor && $user->doctor->status === 'pending') {
                Auth::logout();
                return back()->withErrors([
                    'email' => 'Akun dokter Anda sedang menunggu diverifikasi oleh admin.',
                ])->withInput();
            }

            // Jika user dokter dengan status rejected
            if ($user->role === 'doctor' && $user->doctor && $user->doctor->status === 'rejected') {
                Auth::logout();
                return back()->withErrors([
                    'email' => 'Maaf, pendaftaran akun dokter Anda ditolak.',
                ])->withInput();
            }

            // Jika user toko dengan status pending
            if ($user->role === 'shop' && $user->shop && $user->shop->status === 'pending') {
                Auth::logout();
                return back()->withErrors([
                    'email' => 'Akun toko Anda sedang menunggu diverifikasi oleh admin.',
                ])->withInput();
            }

            // Jika user toko dengan status rejected
            if ($user->role === 'shop' && $user->shop && $user->shop->status === 'rejected') {
                Auth::logout();
                return back()->withErrors([
                    'email' => 'Maaf, pendaftaran akun toko Anda ditolak.',
                ])->withInput();
            }

            // Jika akun tidak aktif
            if (!$user->is_active) {
                Auth::logout();
                return back()->withErrors([
                    'email' => 'Akun Anda dinonaktifkan. Silakan hubungi admin.',
                ])->withInput();
            }

            // Jika semua pemeriksaan lulus, redirect ke dashboard
            return redirect()->intended('/dashboard');
        }

        // Jika autentikasi gagal
        return back()->withErrors([
            'email' => 'Email atau password Anda salah.',
        ])->withInput();
    }

    /**
     * Destroy an authenticated session.
     */
    public function logout(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}