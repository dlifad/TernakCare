<?php

namespace App\Http\Controllers\Farmer;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit()
    {
        $user = Auth::user();
        
        return Inertia::render('Farmer/Profile/Index', [
            'auth' => [
                'user' => $user,
            ]
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:15',
            'address' => 'nullable|string|max:255',
            'photo' => 'nullable|image|max:2048',
        ]);

        $user = $request->user();
        
        // Update user information
        $user->name = $request->name;
        $user->email = $request->email;
        $user->phone = $request->phone;
        $user->address = $request->address;

        // Handle photo upload if included
        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($user->photo_path && Storage::disk('public')->exists($user->photo_path)) {
                Storage::disk('public')->delete($user->photo_path);
            }
            
            // Store new photo
            $path = $request->file('photo')->store('profile-photos', 'public');
            $user->photo_path = $path;
            $user->photo_url = url('storage/' . $path);
        }

        $user->save();

        return back()->with('success', 'Profil berhasil diperbarui');
    }

    /**
     * Update user password
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|current_password',
            'new_password' => 'required|min:8|confirmed',
        ]);

        $user = $request->user();
        $user->password = Hash::make($request->new_password);
        $user->save();

        return back()->with('success', 'Password berhasil diperbarui');
    }
}