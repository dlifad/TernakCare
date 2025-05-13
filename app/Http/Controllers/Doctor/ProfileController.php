<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\Doctor;

class ProfileController extends Controller
{
    public function index()
    {
        $doctor = Auth::user()->doctor->load('user');

        $statistics = [
            'totalConsultations' => $doctor->consultations()->count(),
            'chatConsultations' => $doctor->consultations()->where('type', 'chat')->count(),
            'videoConsultations' => $doctor->consultations()->where('type', 'video')->count(),
            'visitConsultations' => $doctor->consultations()->where('type', 'visit')->count(),
            'completed' => $doctor->consultations()->where('is_completed', true)->count(),
        ];

        return Inertia::render('Doctor/Profile/Index', [
            'doctor' => $doctor->toProfileData(),
            'statistics' => $statistics,
        ]);
    }

    public function edit()
    {
        $doctor = Auth::user()->doctor->load('user');

        return Inertia::render('Doctor/Profile/Index', [
            'doctor' => $doctor->toProfileData()
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'license_number' => 'nullable|string|max:50',
            'years_experience' => 'nullable|integer|min:0',
            'working_hours' => 'nullable|string|max:100',
            'practice_address' => 'nullable|string|max:255',
            'about' => 'nullable|string',
        ]);

        $doctor = Auth::user()->doctor;

        try {
            DB::beginTransaction();

            $doctor->user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'address' => $validated['address'],
            ]);

            $doctor->update([
                'license_number' => $validated['license_number'],
                'years_experience' => $validated['years_experience'],
                'working_hours' => $validated['working_hours'],
                'practice_address' => $validated['practice_address'],
                'about' => $validated['about'],
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Profil berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Gagal update profil dokter:', ['error' => $e->getMessage()]);

            return redirect()->back()->with('error', 'Gagal memperbarui profil');
        }
    }


    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'chat_service_active' => 'boolean',
            'chat_service_fee' => 'nullable|integer|min:0',
            'video_call_service_active' => 'boolean',
            'video_call_service_fee' => 'nullable|integer|min:0',
            'home_visit_service_active' => 'boolean',
            'home_visit_service_fee' => 'nullable|integer|min:0',
        ]);

        try {
            $doctor = Auth::user()->doctor;
            $doctor->update($validated);

            return back()->with('success', 'Pengaturan layanan berhasil diperbarui');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal memperbarui pengaturan layanan');
        }
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = Auth::user();

        // Verifikasi password lama
        if (!Hash::check($request->current_password, $user->password)) {
            return back()->withErrors([
                'current_password' => 'Password saat ini tidak cocok'
            ]);
        }

        // Update password
        $user->password = Hash::make($request->password);
        $user->save();

        return redirect()->route('doctor.profile.edit')->with('success', 'Password berhasil diperbarui');
    }
}
