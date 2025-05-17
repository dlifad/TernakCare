<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;

use Carbon\Carbon;

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
        
        // Dapatkan konsultasi yang tertunda
        $pendingConsultations = Consultation::where('doctor_id', $doctorId)
            ->where('status', 'pending')
            ->with('farmer.user')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($consultation) {
                return [
                    'id' => $consultation->id,
                    'farmerName' => $consultation->farmer->user->name,
                    'farmType' => $consultation->animal_type,
                    'date' => $consultation->schedule ? Carbon::parse($consultation->schedule)->format('Y-m-d') : null,
                    'time' => $consultation->schedule ? Carbon::parse($consultation->schedule)->format('H:i') : null,
                    'type' => $consultation->type,
                    'status' => $consultation->status,
                    'issue' => $consultation->issue,
                    'location' => $consultation->location
                ];
            });
        
        // Dapatkan statistik konsultasi berdasarkan tipe (tanpa filter status)
        $stats = [
            'totalConsultations' => Consultation::where('doctor_id', $doctorId)
                ->where('status', '!=', 'rejected')
                ->count(),

            'chatConsultations' => Consultation::where('doctor_id', $doctorId)
                ->where('type', 'chat')
                ->where('status', '!=', 'rejected')
                ->count(),

            'videoConsultations' => Consultation::where('doctor_id', $doctorId)
                ->where('type', 'video_call')
                ->where('status', '!=', 'rejected')
                ->count(),

            'visitConsultations' => Consultation::where('doctor_id', $doctorId)
                ->where('type', 'visit')
                ->where('status', '!=', 'rejected')
                ->count(),
        ];

        
        // Dapatkan jadwal konsultasi hari ini
        $today = Carbon::today();
        $todaySchedule = Consultation::where('doctor_id', $doctorId)
            ->whereDate('schedule', $today)
            ->whereIn('status', ['approved', 'completed'])
            ->with('farmer.user')
            ->orderBy('schedule', 'asc')
            ->get()
            ->map(function ($consultation) {
                return [
                    'id' => $consultation->id,
                    'farmerName' => $consultation->farmer->user->name ?? 'Tidak ada nama',
                    'farmType' => $consultation->animal_type,
                    'time' => $consultation->schedule ? Carbon::parse($consultation->schedule)->format('H:i') : 'Tidak ada jadwal',
                    'type' => $consultation->type,
                    'status' => $consultation->is_completed ? 'completed' : 'upcoming',
                    'issue' => $consultation->issue ?? 'Tidak ada masalah',
                    'location' => $consultation->location ?? 'Tidak ada lokasi'
                ];
            });
        
        return Inertia::render('Doctor/Dashboard', [
            'pendingConsultations' => $pendingConsultations,
            'stats' => $stats,
            'todaySchedule' => $todaySchedule
        ]);
    }

        public function accept($id)
        {
            $doctor = Auth::user()->doctor;

            if (!$doctor) {
                abort(403, 'Access denied. This account is not a doctor.');
            }

            $consultation = Consultation::findOrFail($id);

            // Check if the consultation belongs to this doctor
            if ($consultation->doctor_id !== $doctor->id) {
                abort(403, 'Access denied. This consultation is not assigned to you.');
            }

            // Check if the consultation is still pending
            if ($consultation->status !== 'pending') {
                return Redirect::back()->with('error', 'This consultation has already been processed.');
            }

            // Update the status to approved
            $consultation->status = 'approved';
            $consultation->save();

            return Redirect::back()->with('success', 'Consultation approved successfully.');
        }
        
        /**
         * Decline a consultation request
         *
         * @param  \Illuminate\Http\Request  $request
         * @param  int  $id
         * @return \Illuminate\Http\RedirectResponse
         */
        public function decline($id)
        {
            $doctor = Auth::user()->doctor;

            if (!$doctor) {
                abort(403, 'Access denied. This account is not a doctor.');
            }

            $consultation = Consultation::findOrFail($id);

            // Check if the consultation belongs to this doctor
            if ($consultation->doctor_id !== $doctor->id) {
                abort(403, 'Access denied. This consultation is not assigned to you.');
            }

            // Check if the consultation is still pending
            if ($consultation->status !== 'pending') {
                return Redirect::back()->with('error', 'This consultation has already been processed.');
            }

            // Update the status to rejected
            $consultation->status = 'rejected';
            $consultation->save();

            return Redirect::back()->with('success', 'Consultation declined successfully.');
        }
}