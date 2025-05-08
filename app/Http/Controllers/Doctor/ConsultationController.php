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
     * @return \Inertia\Response
     */
    public function index()
    {
        $pendingConsultations = Consultation::where('doctor_id', Auth::user()->doctor->id)
            ->where('status', 'pending')
            ->with('farmer.user')
            ->orderBy('created_at', 'desc')
            ->get();
            
        return Inertia::render('Doctor/Consultations/Index', [
            'pendingConsultations' => $pendingConsultations
        ]);
    }

    /**
     * Display the specified consultation.
     *
     * @param  \App\Models\Consultation  $consultation
     * @return \Inertia\Response
     */
    public function show(Consultation $consultation)
    {
        // Check if the consultation belongs to the authenticated doctor
        if ($consultation->doctor_id !== Auth::user()->doctor->id) {
            abort(403, 'Unauthorized action.');
        }

        $consultation->load('farmer.user');
        
        // If this is a chat consultation, load messages
        $chats = null;
        if ($consultation->type === 'chat') {
            $chats = Chat::where('consultation_id', $consultation->id)
                ->orderBy('created_at', 'asc')
                ->get();
        }
        
        return Inertia::render('Doctor/Consultations/Show', [
            'consultation' => $consultation,
            'chats' => $chats
        ]);
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
            ->with('message', "Consultation has been {$request->status}.");
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
            abort(403, 'Cannot send messages to this consultation.');
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
        ]);
        
        return redirect()->route('doctor.consultations.index')
            ->with('message', 'Consultation marked as completed.');
    }
}