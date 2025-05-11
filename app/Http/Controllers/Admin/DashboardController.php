<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Doctor;
use App\Models\Shop;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'totalFarmers' => User::where('role', 'farmer')->count(),
            'totalDoctors' => User::where('role', 'doctor')->count(),
            'totalShops' => User::where('role', 'shop')->count(),
            'pendingApprovals' => $this->countPendingApprovals(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats
        ]);
    }

    public function getStats()
    {
        $stats = [
            'totalFarmers' => User::where('role', 'farmer')->count(),
            'totalDoctors' => User::where('role', 'doctor')->count(),
            'totalShops' => User::where('role', 'shop')->count(),
            'pendingApprovals' => $this->countPendingApprovals(),
        ];

        return response()->json($stats);
    }

    private function countPendingApprovals()
    {
        $pendingDoctors = Doctor::where('status', 'pending')->count();
        $pendingShops = Shop::where('status', 'pending')->count();
        
        return $pendingDoctors + $pendingShops;
    }

    public function getPendingUsers()
    {
        // Mendapatkan dokter dengan status pending
        $pendingDoctors = Doctor::where('status', 'pending')
            ->join('users', 'doctors.user_id', '=', 'users.id')
            ->select('users.id', 'users.name', 'users.email', 'users.role', 'users.created_at')
            ->get();

        // Mendapatkan toko dengan status pending
        $pendingShops = Shop::where('status', 'pending')
            ->join('users', 'shops.user_id', '=', 'users.id')
            ->select('users.id', 'users.name', 'users.email', 'users.role', 'users.created_at')
            ->get();

        // Menggabungkan hasil
        $pendingUsers = $pendingDoctors->merge($pendingShops);

        return response()->json($pendingUsers);
    }

    public function getFarmers()
    {
        $farmers = User::where('role', 'farmer')
            ->select('id', 'name', 'email', 'created_at', 'is_active')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                    'status' => $user->is_active ? 'Active' : 'Suspended'
                ];
            });

        return response()->json($farmers);
    }

    public function getDoctors()
    {
        $doctors = User::where('role', 'doctor')
            ->with('doctor') // Mengasumsikan ada relasi 'doctor' di model User
            ->select('id', 'name', 'email', 'created_at', 'is_active')
            ->get()
            ->map(function ($user) {
                $doctorProfile = $user->doctor;
                $specialty = $doctorProfile ? $doctorProfile->specialty ?? 'General' : 'General';
                $status = $doctorProfile ? $doctorProfile->status : ($user->is_active ? 'active' : 'suspended');

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'specialty' => $specialty,
                    'status' => $status
                ];
            });

        return response()->json($doctors);
    }

    public function getShops()
    {
        $shops = User::where('role', 'shop')
            ->with(['shop', 'shop.products']) // Mengasumsikan ada relasi 'shop' dan 'shop.products'
            ->select('id', 'name', 'email', 'created_at', 'is_active')
            ->get()
            ->map(function ($user) {
                $shopProfile = $user->shop;
                $productCount = $shopProfile && isset($shopProfile->products) ? $shopProfile->products->count() : 0;
                $status = $shopProfile ? $shopProfile->status : ($user->is_active ? 'active' : 'suspended');

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'product_count' => $productCount,
                    'status' => $status
                ];
            });

        return response()->json($shops);
    }

    public function approveUser($id)
    {
        $user = User::findOrFail($id);

        if ($user->role === 'doctor') {
            $doctor = Doctor::where('user_id', $user->id)->first();
            if ($doctor) {
                $doctor->status = 'active';
                $doctor->save();
            }
        } elseif ($user->role === 'shop') {
            $shop = Shop::where('user_id', $user->id)->first();
            if ($shop) {
                $shop->status = 'active';
                $shop->save();
            }
        }

        $user->is_active = 1;
        $user->save();

        return response()->json(['success' => true, 'message' => 'User approved successfully.']);
    }

    public function suspendUser($id)
    {
        $user = User::findOrFail($id);

        if ($user->role === 'doctor') {
            $doctor = Doctor::where('user_id', $user->id)->first();
            if ($doctor) {
                $doctor->status = 'suspended';
                $doctor->save();
            }
        } elseif ($user->role === 'shop') {
            $shop = Shop::where('user_id', $user->id)->first();
            if ($shop) {
                $shop->status = 'suspended';
                $shop->save();
            }
        }

        $user->is_active = 0;
        $user->save();

        return response()->json(['success' => true, 'message' => 'User suspended successfully.']);
    }

    public function activateUser(User $user)
    {
        if ($user->role === 'doctor') {
            $doctor = Doctor::where('user_id', $user->id)->first();
            if ($doctor) {
                $doctor->status = 'active';
                $doctor->save();
            }
        } elseif ($user->role === 'shop') {
            $shop = Shop::where('user_id', $user->id)->first();
            if ($shop) {
                $shop->status = 'active';
                $shop->save();
            }
        }

        $user->is_active = 1;
        $user->save();

        return response()->json(['success' => true, 'message' => 'User activated successfully.']);
    }

    public function deactivateUser(User $user)
    {
        if ($user->role === 'doctor') {
            $doctor = Doctor::where('user_id', $user->id)->first();
            if ($doctor) {
                $doctor->status = 'suspended';
                $doctor->save();
            }
        } elseif ($user->role === 'shop') {
            $shop = Shop::where('user_id', $user->id)->first();
            if ($shop) {
                $shop->status = 'suspended';
                $shop->save();
            }
        }

        $user->is_active = 0;
        $user->save();

        return response()->json(['success' => true, 'message' => 'User deactivated successfully.']);
    }
}
