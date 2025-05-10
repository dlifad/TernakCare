<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use App\Models\Doctor;
use App\Models\Shop;
use App\Providers\RouteServiceProvider;
use App\Notifications\AccountVerificationNotification;
use App\Notifications\AccountRejectedNotification;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $user = Auth::user();

        // Cek apakah email sudah diverifikasi - PRIORITAS PERTAMA
        if (($user->email_verified_at === null) && config('auth.features.email_verification')) {
            return redirect()->route('verification.notice');
        }

        // Hanya lanjutkan pengecekan lain jika email sudah diverifikasi
        
        // Jika user adalah doctor, periksa statusnya
        if ($user->role === 'doctor') {
            $doctor = Doctor::where('user_id', $user->id)->first();

            if ($doctor && $doctor->status === 'pending') {
                Auth::logout();
                return redirect()->route('login')->with('status', 'Email Anda sudah diverifikasi, tetapi pendaftaran dokter Anda masih sedang diverifikasi oleh admin.');
            } elseif ($doctor && $doctor->status === 'rejected') {
                Auth::logout();
                return redirect()->route('login')->with('status', 'Maaf, pendaftaran dokter Anda ditolak oleh admin.');
            }
        }

        // Jika user adalah shop, periksa statusnya
        if ($user->role === 'shop') {
            $shop = Shop::where('user_id', $user->id)->first();

            if ($shop && $shop->status === 'pending') {
                Auth::logout();
                return redirect()->route('login')->with('status', 'Email Anda sudah diverifikasi, tetapi pendaftaran toko Anda masih sedang diverifikasi oleh admin.');
            } elseif ($shop && $shop->status === 'rejected') {
                Auth::logout();
                return redirect()->route('login')->with('status', 'Maaf, pendaftaran toko Anda ditolak oleh admin.');
            }
        }

        $request->session()->regenerate();

        // Redirect berdasarkan role
        switch ($user->role) {
            case 'admin':
                return redirect()->intended(route('admin.dashboard'));
            case 'doctor':
                return redirect()->intended(route('doctor.dashboard'));
            case 'shop':
                return redirect()->intended(route('shop.dashboard'));
            case 'farmer':
                return redirect()->intended(route('farmer.dashboard'));
            default:
                return redirect()->intended(RouteServiceProvider::HOME);
        }
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }

    /**
     * Display the registration view for farmers.
     */
    public function createFarmer(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Display the registration view for doctors.
     */
    public function createDoctor(): Response
    {
        return Inertia::render('Auth/RegisterDoctor');
    }

    /**
     * Display the registration view for shops.
     */
    public function createShop(): Response
    {
        return Inertia::render('Auth/RegisterShop');
    }

    /**
     * Handle an incoming farmer registration request.
     */
    public function storeFarmer(Request $request): RedirectResponse
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
    public function storeDoctor(Request $request): RedirectResponse
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

        // Redirect ke halaman verifikasi email dulu dengan pesan yang jelas
        return redirect()->route('verification.notice')->with('status', 'Silakan verifikasi email Anda terlebih dahulu sebelum pendaftaran dokter Anda diproses.');
    }

    /**
     * Handle an incoming shop registration request.
     */
    public function storeShop(Request $request): RedirectResponse
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

        // Redirect ke halaman verifikasi email dulu dengan pesan yang jelas
        return redirect()->route('verification.notice')->with('status', 'Silakan verifikasi email Anda terlebih dahulu sebelum pendaftaran toko Anda diproses.');
    }

    /**
     * Display the email verification notice.
     */
    public function showVerificationNotice(): Response
    {
        return Inertia::render('Auth/VerifyEmail', [
            'status' => session('status'),
        ]);
    }

    /**
     * Mark the user's email address as verified.
     */
    public function verifyEmail(Request $request, $id, $hash): RedirectResponse
    {
        $user = User::findOrFail($id);

        // Verifikasi hash
        if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            abort(403);
        }

        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        // Setelah email terverifikasi, arahkan ke halaman menunggu verifikasi admin jika perlu
        if (($user->role === 'doctor' || $user->role === 'shop') && !$user->is_approved) {
            return redirect()->route('awaiting.verification', ['userType' => $user->role])
                ->with('status', 'Email Anda telah berhasil diverifikasi. Pendaftaran ' . 
                       ($user->role === 'doctor' ? 'dokter' : 'toko') . ' Anda sedang diverifikasi oleh admin.');
        }

        return redirect('/dashboard')->with('status', 'Email Anda telah berhasil diverifikasi.');
    }

    /**
     * Resend the email verification notification.
     */
    public function resendVerificationEmail(Request $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended('/dashboard');
        }

        $request->user()->sendEmailVerificationNotification();

        return back()->with('status', 'Tautan verifikasi telah dikirim ke email Anda.');
    }

    /**
     * Display awaiting verification page.
     */
    public function awaitingVerification(Request $request): Response
    {
        $userType = $request->query('userType', '');

        // Pastikan email sudah diverifikasi
        if (!Auth::user() || Auth::user()->email_verified_at === null) {
            return redirect()->route('verification.notice')
                ->with('status', 'Anda harus memverifikasi email Anda terlebih dahulu.');
        }

        // Tambahkan pesan yang lebih jelas berdasarkan jenis pengguna
        $message = '';
        if ($userType === 'doctor') {
            $message = 'Email Anda sudah diverifikasi. Pendaftaran dokter Anda sedang diverifikasi oleh admin.';
        } elseif ($userType === 'shop') {
            $message = 'Email Anda sudah diverifikasi. Pendaftaran toko Anda sedang diverifikasi oleh admin.';
        }

        return Inertia::render('Auth/AwaitingVerification', [
            'userType' => $userType,
            'message' => $message
        ]);
    }
}