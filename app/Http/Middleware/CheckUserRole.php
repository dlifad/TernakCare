<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class CheckUserRole
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (!$request->user() || $request->user()->role !== $role) {
            abort(403, 'Unauthorized action.');
        }

        if (!$request->user()->is_active && $request->user()->role !== 'admin') {
            Auth::logout();
            return redirect()->route('login')->with('status', 'Your account is not active. Please wait for admin approval.');
        }

        return $next($request);
    }
}
