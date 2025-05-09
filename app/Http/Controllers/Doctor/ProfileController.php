<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Display the doctor's profile.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $doctor = Auth::user()->doctor->load('user');
        
        // Get the doctor's statistics
        $statistics = [
            'totalConsultations' => $doctor->consultations()->count(),
            'chatConsultations' => $doctor->consultations()->where('type', 'chat')->count(),
            'videoConsultations' => $doctor->consultations()->where('type', 'video')->count(),
            'visitConsultations' => $doctor->consultations()->where('type', 'visit')->count(),
            'completed' => $doctor->consultations()->where('is_completed', true)->count(),
        ];
        
        return Inertia::render('Doctor/Profile/Index', [
            'doctor' => $doctor,
            'statistics' => $statistics
        ]);
    }

    /**
     * Show the form for editing the doctor's profile.
     *
     * @return \Inertia\Response
     */
    public function edit()
    {
        $doctor = Auth::user()->doctor->load('user');
        
        return Inertia::render('Doctor/Profile/Index', [
            'doctor' => $doctor
        ]);
    }

    /**
     * Update the doctor's profile.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request)
    {
        $doctor = Auth::user()->doctor;
        
        $request->validate([
            'specialty' => 'required|string|max:255',
            'experience_years' => 'required|integer|min:0',
            'education' => 'required|string|max:255',
            'license_number' => 'required|string|max:50',
            'bio' => 'nullable|string|max:1000',
            'availability' => 'required|string|max:255',
            'service_areas' => 'nullable|string|max:255',
            'photo' => 'nullable|image|max:2048', // Max 2MB
            
            // User fields
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
        ]);
        
        // Update user information
        $doctor->user->update([
            'name' => $request->name,
            'phone' => $request->phone,
            'address' => $request->address,
        ]);
        
        // Handle profile photo upload
        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($doctor->photo && Storage::disk('public')->exists($doctor->photo)) {
                Storage::disk('public')->delete($doctor->photo);
            }
            
            $path = $request->file('photo')->store('doctor-photos', 'public');
            $doctor->photo = $path;
        }
        
        // Update doctor information
        $doctor->update([
            'specialty' => $request->specialty,
            'experience_years' => $request->experience_years,
            'education' => $request->education,
            'license_number' => $request->license_number,
            'bio' => $request->bio,
            'availability' => $request->availability,
            'service_areas' => $request->service_areas,
        ]);
        
        return redirect()->route('doctor.profile.index')->with('message', 'Profile updated successfully');
    }

    /**
     * Update doctor's consultation settings.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateSettings(Request $request)
    {
        $doctor = Auth::user()->doctor;
        
        $request->validate([
            'chat_rate' => 'nullable|numeric|min:0',
            'video_rate' => 'nullable|numeric|min:0',
            'visit_rate' => 'nullable|numeric|min:0',
            'accepts_chat' => 'boolean',
            'accepts_video' => 'boolean',
            'accepts_visit' => 'boolean',
        ]);
        
        $doctor->update([
            'chat_rate' => $request->chat_rate,
            'video_rate' => $request->video_rate,
            'visit_rate' => $request->visit_rate,
            'accepts_chat' => $request->accepts_chat,
            'accepts_video' => $request->accepts_video,
            'accepts_visit' => $request->accepts_visit,
        ]);
        
        return redirect()->route('doctor.profile.index')->with('message', 'Consultation settings updated successfully');
    }
}