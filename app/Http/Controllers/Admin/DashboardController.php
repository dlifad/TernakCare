<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Doctor;
use App\Models\Shop;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display admin dashboard with pending approval users.
     */
    public function index()
    {
        $pendingUsers = User::whereIn('role', ['doctor', 'shop'])
            ->where('is_active', 0) // Menggunakan 'is_active' untuk status pending
            ->with(['doctor', 'shop'])
            ->get();
    

        return Inertia::render('Admin/Dashboard', [
            'pendingUsers' => $pendingUsers,
        ]);
    }

    /**
     * Approve a user account.
     */
    public function approveUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $user->status = 'active';
        $user->save();

        return redirect()->back()->with('message', 'User approved successfully.');
    }

    /**
     * Reject a user account.
     */
    public function rejectUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $user->status = 'rejected';
        $user->save();

        return redirect()->back()->with('message', 'User rejected successfully.');
    }

    /**
     * View all approved doctors.
     */
    public function doctors()
    {
        $doctors = User::where('role', 'doctor')
            ->where('status', 'active')
            ->with('doctor')
            ->get();

        return Inertia::render('Admin/Doctors', [
            'doctors' => $doctors,
        ]);
    }

    /**
     * View all approved shops.
     */
    public function shops()
    {
        $shops = User::where('role', 'shop')
            ->where('status', 'active')
            ->with('shop')
            ->get();

        return Inertia::render('Admin/Shops', [
            'shops' => $shops,
        ]);
    }

    /**
     * View all farmers.
     */
    public function farmers()
    {
        $farmers = User::where('role', 'farmer')
            ->with('farmer')
            ->get();

        return Inertia::render('Admin/Farmers', [
            'farmers' => $farmers,
        ]);
    }
}