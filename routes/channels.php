<?php

use App\Models\Consultation;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Auth; // Tambahkan ini

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Channel untuk chat konsultasi
// Nama channel: consultation.{consultationId} -> cocokkan dengan yang di event NewChatMessage
Broadcast::channel('consultation.{consultationId}', function ($user, $consultationId) {
    // $user adalah instance User yang sedang terautentikasi
    // $consultationId adalah ID konsultasi dari nama channel

    $consultation = Consultation::find($consultationId);

    if (!$consultation) {
        return false; // Konsultasi tidak ditemukan
    }

    // Cek apakah user yang login adalah farmer yang terkait dengan konsultasi ini
    if ($user->role === 'farmer' && $consultation->farmer_id === $user->farmer->id) {
        return true;
    }

    // Cek apakah user yang login adalah dokter yang terkait dengan konsultasi ini
    if ($user->role === 'doctor' && $consultation->doctor_id === $user->doctor->id) {
        return true;
    }

    return false; // User tidak berhak mengakses channel ini
});