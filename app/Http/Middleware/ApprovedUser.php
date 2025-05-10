<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApprovedUser
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user || !$user->is_approved) {
            if ($user->role === 'doctor' || $user->role === 'shop') {
                return redirect()->route('awaiting.verification', ['userType' => $user->role]);
            }
            
            return redirect('/')->with('error', 'Akun Anda belum disetujui oleh admin.');
        }

        // Jika role adalah dokter, periksa status dokter
        if ($user->role === 'doctor' && (!$user->doctor || $user->doctor->status !== 'verified')) {
            return redirect()->route('awaiting.verification', ['userType' => 'doctor']);
        }

        // Jika role adalah toko, periksa status toko
        if ($user->role === 'shop' && (!$user->shop || $user->shop->status !== 'verified')) {
            return redirect()->route('awaiting.verification', ['userType' => 'shop']);
        }

        return $next($request);
    }
}