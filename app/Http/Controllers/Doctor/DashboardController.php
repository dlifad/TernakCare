<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    /**
     * Menampilkan dashboard dokter.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $doctor = Auth::user()->doctor;

        if (!$doctor) {
            abort(403, 'Akses ditolak. Akun ini bukan dokter.');
        }

        $doctorId = $doctor->id;

        
        // Dapatkan konsultasi yang tertunda dan memerlukan persetujuan
        $pendingConsultations = Consultation::where('doctor_id', $doctorId)
            ->where('status', 'pending')
            ->with('farmer.user')
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Dapatkan konsultasi yang aktif
        $activeConsultations = Consultation::where('doctor_id', $doctorId)
            ->where('status', 'approved')
            ->where('is_completed', false)
            ->with('farmer.user')
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Dapatkan statistik konsultasi
        $totalConsultations = Consultation::where('doctor_id', $doctorId)->count();
        $completedConsultations = Consultation::where('doctor_id', $doctorId)
            ->where('is_completed', true)
            ->count();
        
        return Inertia::render('Doctor/Dashboard', [
            'pendingConsultations' => $pendingConsultations,
            'activeConsultations' => $activeConsultations,
            'totalConsultations' => $totalConsultations,
            'completedConsultations' => $completedConsultations
        ]);
    }
}