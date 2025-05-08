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
     * Display the doctor dashboard.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        // Get pending consultations that need approval
        $pendingConsultations = Consultation::where('doctor_id', auth::user()->doctor->id)
            ->where('status', 'pending')
            ->with('farmer.user')
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Get active consultations
        $activeConsultations = Consultation::where('doctor_id', auth::user()->doctor->id)
            ->where('status', 'approved')
            ->where('is_completed', false)
            ->with('farmer.user')
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Get consultation statistics
        $totalConsultations = Consultation::where('doctor_id', auth::user()->doctor->id)->count();
        $completedConsultations = Consultation::where('doctor_id', auth::user()->doctor->id)
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