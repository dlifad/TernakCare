<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $role
     * @return mixed
     */
    public function handle(Request $request, Closure $next, $role)
    {
        // Check if user is logged in
        if (!Auth::check()) {
            return redirect('login');
        }

        // Check if user has the required role
        if (Auth::user()->role != $role) {
            // Redirect to appropriate dashboard based on role
            if (Auth::user()->role == 'farmer') {
                return redirect()->route('farmer.dashboard');
            } elseif (Auth::user()->role == 'doctor') {
                return redirect()->route('doctor.dashboard');
            } elseif (Auth::user()->role == 'shop') {
                return redirect()->route('shop.dashboard');
            } else {
                // Fallback to general dashboard
                return redirect()->route('dashboard');
            }
        }

        return $next($request);
    }
}