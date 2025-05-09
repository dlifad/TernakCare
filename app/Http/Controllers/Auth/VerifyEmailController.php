<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            // Untuk pengguna yang sudah diverifikasi email-nya
            return $this->handleVerifiedRedirect($request);
        }

        if ($request->user()->markEmailAsVerified()) {
            event(new Verified($request->user()));
        }

        return $this->handleVerifiedRedirect($request);
    }

    /**
     * Redirect user based on their role after verification
     */
    private function handleVerifiedRedirect($request): RedirectResponse
    {
        $user = $request->user();
        
        // Cek apakah user adalah dokter yang memerlukan verifikasi admin
        if ($user->role === 'doctor') {
            $doctor = $user->doctor;
            if ($doctor && $doctor->status === 'pending') {
                return redirect()->route('awaiting.verification', ['userType' => 'doctor']);
            }
        }
        
        // Cek apakah user adalah toko yang memerlukan verifikasi admin
        if ($user->role === 'shop') {
            $shop = $user->shop;
            if ($shop && $shop->status === 'pending') {
                return redirect()->route('awaiting.verification', ['userType' => 'shop']);
            }
        }
        
        // Untuk pengguna yang tidak memerlukan verifikasi admin atau yang sudah diverifikasi admin
        return redirect()->intended(route('dashboard', absolute: false).'?verified=1');
    }
}