<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Doctor;
use App\Models\Shop;
use App\Notifications\AccountVerifiedNotification;
use App\Notifications\AccountRejectedNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VerificationController extends Controller
{
    /**
     * Tampilkan daftar pengguna yang menunggu verifikasi
     */
    public function index()
    {
        $pendingDoctors = Doctor::with('user')
            ->where('status', 'pending')
            ->get();

        $pendingShops = Shop::with('user')
            ->where('status', 'pending')
            ->get();

        $rejectedDoctors = Doctor::with('user')
            ->where('status', 'rejected')
            ->get();

        $rejectedShops = Shop::with('user')
            ->where('status', 'rejected')
            ->get();

        $verifiedDoctors = Doctor::with('user')
            ->where('status', 'verified')
            ->get();

        $verifiedShops = Shop::with('user')
            ->where('status', 'verified')
            ->get();

        return Inertia::render('Admin/Verification/Index', [
            'pendingDoctors' => $pendingDoctors,
            'pendingShops' => $pendingShops,
            'rejectedDoctors' => $rejectedDoctors,
            'rejectedShops' => $rejectedShops,
            'verifiedDoctors' => $verifiedDoctors,
            'verifiedShops' => $verifiedShops,
        ]);
    }

    /**
     * Verifikasi pendaftaran dokter
     */
    public function verifyDoctor($id)
    {
        $doctor = Doctor::findOrFail($id);
        $doctor->status = 'verified';
        $doctor->save();

        $user = User::findOrFail($doctor->user_id);
        $user->is_approved = true;
        $user->save();

        // Kirim notifikasi email
        $user->notify(new AccountVerifiedNotification('doctor'));

        return back()->with('success', 'Dokter berhasil diverifikasi');
    }

    /**
     * Verifikasi pendaftaran toko
     */
    public function verifyShop($id)
    {
        $shop = Shop::findOrFail($id);
        $shop->status = 'verified';
        $shop->save();

        $user = User::findOrFail($shop->user_id);
        $user->is_approved = true;
        $user->save();

        // Kirim notifikasi email
        $user->notify(new AccountVerifiedNotification('shop'));

        return back()->with('success', 'Toko berhasil diverifikasi');
    }

    /**
     * Tolak pendaftaran dokter
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

        $user = User::findOrFail($doctor->user_id);
        $user->is_approved = false;
        $user->save();

        // Kirim notifikasi email
        $user->notify(new AccountRejectedNotification('doctor', $request->rejection_reason));

        return back()->with('success', 'Pendaftaran dokter berhasil ditolak');
    }

    /**
     * Tolak pendaftaran toko
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

        $user = User::findOrFail($shop->user_id);
        $user->is_approved = false;
        $user->save();

        // Kirim notifikasi email
        $user->notify(new AccountRejectedNotification('shop', $request->rejection_reason));

        return back()->with('success', 'Pendaftaran toko berhasil ditolak');
    }
}