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

        // 🚩 Jangan redirect lagi kalau sudah di halaman awaiting verification
        if ($request->routeIs('awaiting.verification')) {
            return $next($request);
        }

        if (!$user || !$user->is_approved) {
            if ($user && ($user->role === 'doctor' || $user->role === 'shop')) {
                return redirect()->route('awaiting.verification', ['userType' => $user->role]);
            }

            return redirect('/')->with('error', 'Akun Anda belum disetujui oleh admin.');
        }

        if ($user->role === 'doctor' && (!$user->doctor || $user->doctor->status !== 'verified')) {
            return redirect()->route('awaiting.verification', ['userType' => 'doctor']);
        }

        if ($user->role === 'shop' && (!$user->shop || $user->shop->status !== 'verified')) {
            return redirect()->route('awaiting.verification', ['userType' => 'shop']);
        }

        return $next($request);
    }
}
