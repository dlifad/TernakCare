<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\Chat;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class ConsultationController extends Controller
{
    /**
     * Display a listing of the consultations.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        // Ambil semua konsultasi yang dimiliki oleh dokter yang sedang login
        $query = Consultation::where('doctor_id', Auth::user()->doctor->id)
            ->with(['farmer.user', 'chats']);
        
        // Filter berdasarkan tipe konsultasi jika parameter tipe diberikan
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }
        
        $consultations = $query->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($consultation) {
                return [
                    'id' => $consultation->id,
                    'patient_name' => $consultation->farmer->user->name,
                    'status' => $consultation->status,
                    'date' => $consultation->schedule ? $consultation->schedule->format('d M Y') : '-',
                    'time' => $consultation->schedule ? $consultation->schedule->format('H:i') . ' - ' . 
                        $consultation->schedule->addHour()->format('H:i') : '-',
                    'animal_type' => $consultation->animal_type ?? '-',
                    'consultation_type' => $consultation->type,
                    'complaint' => $consultation->issue,
                    'image' => null, // Tambahkan logic untuk gambar jika diperlukan
                    'location' => $consultation->location,
                    'is_completed' => $consultation->is_completed,
                    'is_paid' => (bool)$consultation->is_paid, // Konversi ke boolean
                    'payment_status' => $consultation->payment_status
                ];
            });
        
        return Inertia::render('Doctor/Consultations/Index', [
            'consultations' => $consultations,
            'filters' => [
                'type' => $request->type ?? 'all',
                'status' => $request->status ?? 'all'
            ]
        ]);
    }

    /**
     * Display the specified consultation.
     *
     * @param  int  $id
     * @return \Inertia\Response
     */
    public function show($id)
    {
        $consultation = Consultation::with(['farmer.user', 'chats'])->findOrFail($id);
        
        // Check if the consultation belongs to the authenticated doctor
        if ($consultation->doctor_id !== Auth::user()->doctor->id) {
            abort(403, 'Unauthorized action.');
        }
        
        return Inertia::render('Doctor/Consultations/Show', [
            'consultation' => [
                'id' => $consultation->id,
                'patient_name' => $consultation->farmer->user->name,
                'status' => $consultation->status,
                'date' => $consultation->schedule ? $consultation->schedule->format('d M Y') : '-',
                'time' => $consultation->schedule ? $consultation->schedule->format('H:i') . ' - ' . 
                    $consultation->schedule->addHour()->format('H:i') : '-',
                'animal_type' => $consultation->animal_type ?? '-',
                'consultation_type' => $consultation->type,
                'complaint' => $consultation->issue,
                'description' => $consultation->description,
                'notes' => $consultation->notes,
                'location' => $consultation->location,
                'is_completed' => $consultation->is_completed,
                'created_at' => $consultation->created_at->format('d M Y H:i'),
                'chats' => $consultation->chats->map(function ($chat) {
                    return [
                        'id' => $chat->id,
                        'message' => $chat->message,
                        'sender_type' => $chat->sender_type,
                        'created_at' => $chat->created_at->format('d M Y H:i')
                    ];
                })
            ]
        ]);
    }

    /**
     * Filter consultations by type.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function filterByType(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string|in:all,chat,video_call,visit',
        ]);
        
        return redirect()->route('doctor.consultations.index', ['type' => $validated['type']]);
    }

    /**
     * Filter consultations by status.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function filterByStatus(Request $request)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:all,pending,approved,completed,rejected',
        ]);
        
        return redirect()->route('doctor.consultations.index', ['status' => $validated['status']]);
    }

    /**
     * Update the consultation status (approve/reject).
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Consultation  $consultation
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateStatus(Request $request, Consultation $consultation)
    {
        // Check if the consultation belongs to the authenticated doctor
        if ($consultation->doctor_id !== Auth::user()->doctor->id) {
            abort(403, 'Unauthorized action.');
        }
        
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'notes' => 'nullable|string|max:255',
        ]);
        
        $consultation->update([
            'status' => $request->status,
            'notes' => $request->notes ?? null,
        ]);
        
        return redirect()->route('doctor.consultations.index')
            ->with('message', "Konsultasi telah " . 
                ($request->status == 'approved' ? 'disetujui' : 'ditolak') . ".");
    }

    /**
     * Approve the consultation.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Consultation  $consultation
     * @return \Illuminate\Http\RedirectResponse
     */
    public function approve(Request $request, Consultation $consultation)
    {
        // Check if the consultation belongs to the authenticated doctor
        if ($consultation->doctor_id !== Auth::user()->doctor->id) {
            abort(403, 'Unauthorized action.');
        }
        
        $request->validate([
            'notes' => 'nullable|string|max:255',
        ]);
        
        $consultation->update([
            'status' => 'approved',
            'notes' => $request->notes ?? null,
        ]);
        
        return redirect()->route('doctor.consultations.index')
            ->with('message', 'Konsultasi telah disetujui.');
    }

    /**
     * Reject the consultation.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Consultation  $consultation
     * @return \Illuminate\Http\RedirectResponse
     */
    public function reject(Request $request, Consultation $consultation)
    {
        // Check if the consultation belongs to the authenticated doctor
        if ($consultation->doctor_id !== Auth::user()->doctor->id) {
            abort(403, 'Unauthorized action.');
        }
        
        $request->validate([
            'notes' => 'nullable|string|max:255',
        ]);
        
        $consultation->update([
            'status' => 'rejected',
            'notes' => $request->notes ?? null,
        ]);
        
        return redirect()->route('doctor.consultations.index')
            ->with('message', 'Konsultasi telah ditolak.');
    }

    /**
     * Send a message in a chat consultation.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Consultation  $consultation
     * @return \Illuminate\Http\RedirectResponse
     */
    public function sendMessage(Request $request, Consultation $consultation)
    {
        // Check if the consultation belongs to the authenticated doctor
        if ($consultation->doctor_id !== Auth::user()->doctor->id) {
            abort(403, 'Unauthorized action.');
        }
        
        // Check if consultation is of type chat and approved
        if ($consultation->type !== 'chat' || $consultation->status !== 'approved') {
            abort(403, 'Tidak dapat mengirim pesan ke konsultasi ini.');
        }
        
        $request->validate([
            'message' => 'required|string',
        ]);
        
        Chat::create([
            'consultation_id' => $consultation->id,
            'sender_type' => 'doctor',
            'sender_id' => Auth::user()->doctor->id,
            'message' => $request->message,
        ]);
        
        return back();
    }

    /**
     * Mark consultation as completed.
     *
     * @param  \App\Models\Consultation  $consultation
     * @return \Illuminate\Http\RedirectResponse
     */
    public function complete(Consultation $consultation)
    {
        // Check if the consultation belongs to the authenticated doctor
        if ($consultation->doctor_id !== Auth::user()->doctor->id) {
            abort(403, 'Unauthorized action.');
        }
        
        $consultation->update([
            'is_completed' => true,
            'status' => 'completed'
        ]);
        
        return redirect()->route('doctor.consultations.index')
            ->with('message', 'Konsultasi telah ditandai selesai.');
    }
}