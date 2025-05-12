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
        $user = Auth::user();

        // Validasi input
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Update data user dasar
        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->phone = $validated['phone'] ?? $user->phone;
        $user->address = $validated['address'] ?? $user->address;

        // Jika ada foto baru, simpan dan update path di database
        if ($request->hasFile('photo') && $request->file('photo')->isValid()) {
            // Hapus foto lama jika ada
            if ($user->photo_path && Storage::exists('public/' . $user->photo_path)) {
                Storage::delete('public/' . $user->photo_path);
            }

            // Buat nama file yang unik dengan timestamp
            $filename = time() . '_' . $request->file('photo')->getClientOriginalName();

            // Simpan foto baru
            $photoPath = $request->file('photo')->storeAs('profile_photos', $filename, 'public');
            $user->photo_path = $photoPath;
            $user->photo_url = url('storage/' . $photoPath); // Gunakan url() helper untuk URL lengkap
        }

        $user->save();

        // Kembalikan dengan data yang diperbarui
        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui',
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'address' => $user->address,
                'photo_url' => $user->photo_url,
            ]
        ]);
    }

    public function placeholder($width = 100, $height = 100)
    {
        // Buat placeholder image sederhana
        $img = imagecreatetruecolor($width, $height);
        $bgColor = imagecolorallocate($img, 240, 240, 240);
        $textColor = imagecolorallocate($img, 100, 100, 100);

        imagefill($img, 0, 0, $bgColor);
        $text = $width . 'x' . $height;
        imagestring($img, 5, ($width - strlen($text) * 5) / 2, ($height - 10) / 2, $text, $textColor);

        header('Content-Type: image/png');
        imagepng($img);
        imagedestroy($img);
        exit;
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
