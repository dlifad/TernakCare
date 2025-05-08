<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Redirect to the appropriate dashboard based on user role.
     */
    public function index()
    {
        $user = Auth::user();
        
        if ($user->role === 'farmer') {
            return redirect()->route('farmer.dashboard');
        } elseif ($user->role === 'doctor') {
            return redirect()->route('doctor.dashboard');
        } elseif ($user->role === 'shop') {
            return redirect()->route('shop.dashboard');
        } elseif ($user->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }
        
        // Fallback
        return Inertia::render('Dashboard');
    }
    
    /**
     * Display the farmer dashboard.
     */
    public function farmerDashboard()
    {
        return Inertia::render('Farmer/Dashboard', [
            'user' => Auth::user(),
            // Add additional data needed for farmer dashboard
        ]);
    }
    
    /**
     * Display the doctor dashboard.
     */
    public function doctorDashboard()
    {
        $user = Auth::user();
        $doctor = $user->doctor;
        
        return Inertia::render('Doctor/Dashboard', [
            'user' => $user,
            'doctor' => $doctor,
            'isPending' => $doctor->isPending(),
            // Add additional data needed for doctor dashboard
        ]);
    }
    
    /**
     * Display the shop dashboard.
     */
    public function shopDashboard()
    {
        $user = Auth::user();
        $shop = $user->shop;
        
        return Inertia::render('Shop/Dashboard', [
            'user' => $user,
            'shop' => $shop,
            'isPending' => $shop->isPending(),
            // Add additional data needed for shop dashboard
        ]);
    }
}