<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\Shop;
use App\Models\User;
use App\Notifications\AccountVerificationNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VerificationController extends Controller
{
    /**
     * Display a listing of pending verifications.
     */
    public function index()
    {
        // Ambil dokter yang masih dalam status pending
        $pendingDoctors = Doctor::with('user')
            ->where('status', 'pending')
            ->get();
            
        // Ambil toko yang masih dalam status pending
        $pendingShops = Shop::with('user')
            ->where('status', 'pending')
            ->get();
            
        return Inertia::render('Admin/Verification/Index', [
            'pendingDoctors' => $pendingDoctors,
            'pendingShops' => $pendingShops,
        ]);
    }
    
    /**
     * Approve a doctor registration.
     */
    public function approveDoctor($id)
    {
        $doctor = Doctor::findOrFail($id);
        $doctor->status = 'approved';
        $doctor->save();
        
        // Update user active status
        $user = User::findOrFail($doctor->user_id);
        $user->notify(new AccountVerificationNotification('approved', 'doctor'));
        
        return redirect()->back()->with('message', 'Pendaftaran dokter berhasil disetujui.');
    }
    
    /**
     * Reject a doctor registration.
     */
    public function rejectDoctor(Request $request, $id)
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);
        
        $doctor = Doctor::findOrFail($id);
        $doctor->status = 'rejected';
        $doctor->rejection_reason = $request->rejection_reason;
        $doctor->save();
        
        // Notify user
        $user = User::findOrFail($doctor->user_id);
        $user->notify(new AccountVerificationNotification('rejected', 'doctor', $request->rejection_reason));
        
        return redirect()->back()->with('message', 'Pendaftaran dokter ditolak.');
    }
    
    /**
     * Approve a shop registration.
     */
    public function approveShop($id)
    {
        $shop = Shop::findOrFail($id);
        $shop->status = 'approved';
        $shop->save();
        
        // Notify user
        $user = User::findOrFail($shop->user_id);
        $user->notify(new AccountVerificationNotification('approved', 'shop'));
        
        return redirect()->back()->with('message', 'Pendaftaran toko berhasil disetujui.');
    }
    
    /**
     * Reject a shop registration.
     */
    public function rejectShop(Request $request, $id)
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);
        
        $shop = Shop::findOrFail($id);
        $shop->status = 'rejected';
        $shop->rejection_reason = $request->rejection_reason;
        $shop->save();
        
        // Notify user
        $user = User::findOrFail($shop->user_id);
        $user->notify(new AccountVerificationNotification('rejected', 'shop', $request->rejection_reason));
        
        return redirect()->back()->with('message', 'Pendaftaran toko ditolak.');
    }
}