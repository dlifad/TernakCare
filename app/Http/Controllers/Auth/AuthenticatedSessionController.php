<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\Doctor;
use App\Models\Shop;
use App\Providers\RouteServiceProvider;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
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

        // Cek apakah email sudah diverifikasi
        if (($user->email_verified_at === null) && config('auth.features.email_verification')) {
            return redirect()->route('verification.notice');
        }

        // Jika user adalah doctor, periksa statusnya
        if ($user->role === 'doctor') {
            $doctor = Doctor::where('user_id', $user->id)->first();

            if ($doctor && $doctor->status === 'pending') {
                // Jangan logout user, arahkan ke halaman menunggu verifikasi admin
                return redirect()->route('awaiting.verification', ['userType' => 'doctor']);
            } elseif ($doctor && $doctor->status === 'rejected') {
                Auth::logout();
                return redirect()->route('login')->with('status', 'Maaf, pendaftaran dokter Anda ditolak oleh admin. Silakan periksa email untuk informasi lebih lanjut.');
            }
        }

        // Jika user adalah shop, periksa statusnya
        if ($user->role === 'shop') {
            $shop = Shop::where('user_id', $user->id)->first();

            if ($shop && $shop->status === 'pending') {
                // Jangan logout user, arahkan ke halaman menunggu verifikasi admin
                return redirect()->route('awaiting.verification', ['userType' => 'shop']);
            } elseif ($shop && $shop->status === 'rejected') {
                Auth::logout();
                return redirect()->route('login')->with('status', 'Maaf, pendaftaran toko Anda ditolak oleh admin. Silakan periksa email untuk informasi lebih lanjut.');
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
}
