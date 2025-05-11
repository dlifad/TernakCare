<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Doctor;
use App\Models\Farmer;
use App\Models\Shop;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Http\JsonResponse;


class DashboardController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('Admin/Dashboard');
    }

    public function getStats()
    {
        $stats = [
            'totalFarmers' => Farmer::count(),
            'totalDoctors' => Doctor::count(),
            'totalShops' => Shop::count(),
            'pendingApprovals' =>
            User::whereHas('doctor', function ($query) {
                $query->where('status', 'pending');
            })
                ->orWhereHas('shop', function ($query) {
                    $query->where('status', 'pending');
                })
                ->count()
        ];

        return response()->json($stats);
    }

    public function getPendingUsers()
    {
        $pendingUsers = User::with(['doctor', 'shop'])
            ->where(function ($query) {
                $query->whereHas('doctor', function ($q) {
                    $q->where('status', 'pending');
                })
                    ->orWhereHas('shop', function ($q) {
                        $q->where('status', 'pending');
                    });
            })
            ->get()
            ->map(function ($user) {
                $role = $user->doctor ? 'doctor' : ($user->shop ? 'shop' : 'unknown');
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $role,
                    'created_at' => $user->created_at,
                    'profile' => $role === 'doctor' ? $user->doctor : ($role === 'shop' ? $user->shop : null)
                ];
            });

        return response()->json($pendingUsers);
    }

    public function getFarmers()
    {
        $farmers = User::whereHas('farmer')
            ->with('farmer')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'isActive' => $user->is_active,
                    'created_at' => $user->created_at,
                    'role' => 'farmer', // ✅ Tambahkan ini
                    'farmer' => $user->farmer
                ];
            });

        return response()->json($farmers);
    }


    public function getDoctors()
    {
        $doctors = User::whereHas('doctor')
            ->with('doctor')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'isActive' => $user->is_active,
                    'status' => $user->doctor->status,
                    'specialty' => $user->doctor->specialty ?? '',
                    'role' => 'doctor',
                    'created_at' => $user->created_at
                ];
            });

        return response()->json($doctors);
    }

    public function getShops()
    {
        $shops = User::whereHas('shop')
            ->with('shop')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'isActive' => $user->is_active,
                    'status' => $user->shop->status,
                    'role' => 'shop',
                    'created_at' => $user->created_at
                ];
            });

        return response()->json($shops);
    }

    public function userDetail($id)
    {
        $user = User::with(['doctor', 'shop', 'farmer'])->findOrFail($id);
        return Inertia::render('Admin/UserDetail', [
            'user' => $user
        ]);
    }

    public function approveUser($id)
    {
        $user = User::with(['doctor', 'shop'])->findOrFail($id);

        if ($user->doctor) {
            $user->doctor->update(['status' => 'verified']);
        } elseif ($user->shop) {
            $user->shop->update(['status' => 'verified']);
        }

        return response()->json(['message' => 'User approved successfully']);
    }

    public function rejectUser($id)
    {
        $user = User::with(['doctor', 'shop'])->findOrFail($id);

        if ($user->doctor) {
            $user->doctor->update(['status' => 'rejected']);
        } elseif ($user->shop) {
            $user->shop->update(['status' => 'rejected']);
        }

        return response()->json(['message' => 'User rejected successfully']);
    }

    // public function toggleActiveStatus($id)
    // {
    //     $user = User::findOrFail($id);
    //     $user->update(['isActive' => !$user->isActive]);

    //     return response()->json([
    //         'message' => $user->isActive ? 'User activated successfully' : 'User suspended successfully'
    //     ]);
    // }

    public function toggleActive(Request $request, $id): JsonResponse
    {
        $request->validate(['isActive' => 'required|boolean']);

        try {
            $user = User::findOrFail($id);
            $user->is_active = $request->isActive;
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Status updated successfully.',
                'isActive' => $user->is_active,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user status.',
            ], 500);
        }
    }
}
