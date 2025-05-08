<?php

namespace App\Http\Controllers\Farmer;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\Doctor;
use App\Models\Chat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ConsultationController extends Controller
{
    /**
     * Display the list of available doctors for consultation.
     */
    public function index()
    {
        $doctors = Doctor::whereHas('user', function ($query) {
            $query->where('status', 'active');
        })->with('user')
            ->get();

        return Inertia::render('Farmer/Consultation/Index', [
            'doctors' => $doctors,
        ]);
    }

    /**
     * Display the doctor's profile and consultation options.
     */
    public function showDoctor($id)
    {
        $doctor = Doctor::with('user')->findOrFail($id);
        
        return Inertia::render('Farmer/Consultation/Doctor', [
            'doctor' => $doctor,
        ]);
    }

    /**
     * Request a new chat consultation.
     */
    public function requestChat(Request $request, $doctorId)
    {
        $request->validate([
            'issue' => 'required|string|max:500',
            'animal_type' => 'required|string|max:100',
        ]);

        $consultation = Consultation::create([
            'farmer_id' => Auth::user()->farmer->id,
            'doctor_id' => $doctorId,
            'type' => 'chat',
            'status' => 'pending',
            'issue' => $request->issue,
            'animal_type' => $request->animal_type,
        ]);

        return redirect()->route('farmer.consultations.show', $consultation->id)
            ->with('message', 'Chat consultation request sent successfully.');
    }

    /**
     * Request a new video call consultation.
     */
    public function requestVideoCall(Request $request, $doctorId)
    {
        $request->validate([
            'issue' => 'required|string|max:500',
            'animal_type' => 'required|string|max:100',
            'preferred_time' => 'required|date|after:now',
        ]);

        $consultation = Consultation::create([
            'farmer_id' => Auth::user()->farmer->id,
            'doctor_id' => $doctorId,
            'type' => 'video_call',
            'status' => 'pending',
            'issue' => $request->issue,
            'animal_type' => $request->animal_type,
            'preferred_time' => $request->preferred_time,
        ]);

        return redirect()->route('farmer.consultations.show', $consultation->id)
            ->with('message', 'Video call consultation request sent successfully.');
    }

    /**
     * Request a new visit consultation.
     */
    public function requestVisit(Request $request, $doctorId)
    {
        $request->validate([
            'issue' => 'required|string|max:500',
            'animal_type' => 'required|string|max:100',
            'preferred_date' => 'required|date|after:now',
            'address' => 'required|string|max:255',
            'additional_info' => 'nullable|string|max:1000',
        ]);

        $consultation = Consultation::create([
            'farmer_id' => Auth::user()->farmer->id,
            'doctor_id' => $doctorId,
            'type' => 'visit',
            'status' => 'pending',
            'issue' => $request->issue,
            'animal_type' => $request->animal_type,
            'preferred_time' => $request->preferred_date,
            'location' => $request->address,
            'additional_info' => $request->additional_info,
        ]);

        return redirect()->route('farmer.consultations.show', $consultation->id)
            ->with('message', 'Visit consultation request sent successfully.');
    }

    /**
     * Display a specific consultation.
     */
    public function show($id)
    {
        $consultation = Consultation::with(['doctor.user', 'chats'])
            ->where('farmer_id', Auth::user()->farmer->id)
            ->findOrFail($id);

        return Inertia::render('Farmer/Consultation/Show', [
            'consultation' => $consultation,
        ]);
    }

    /**
     * Send a chat message in an active chat consultation.
     */
    public function sendMessage(Request $request, $consultationId)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $consultation = Consultation::where('farmer_id', Auth::user()->farmer->id)
            ->findOrFail($consultationId);

        if ($consultation->status !== 'active') {
            return back()->with('error', 'Cannot send messages in a consultation that is not active.');
        }

        $chat = Chat::create([
            'consultation_id' => $consultationId,
            'sender_id' => Auth::id(),
            'sender_type' => 'farmer',
            'message' => $request->message,
        ]);

        return back();
    }

    /**
     * Join a video call.
     */
    public function joinVideoCall($consultationId)
    {
        $consultation = Consultation::where('farmer_id', Auth::user()->farmer->id)
            ->where('type', 'video_call')
            ->findOrFail($consultationId);

        if ($consultation->status !== 'active') {
            return back()->with('error', 'This video call is not currently active.');
        }

        return Inertia::render('Farmer/Consultation/VideoCall', [
            'consultation' => $consultation,
        ]);
    }

    /**
     * Complete a consultation.
     */
    public function complete(Request $request, $consultationId)
    {
        $consultation = Consultation::where('farmer_id', Auth::user()->farmer->id)
            ->findOrFail($consultationId);

        if ($consultation->status !== 'active') {
            return back()->with('error', 'Cannot complete a consultation that is not active.');
        }

        $consultation->status = 'completed';
        $consultation->farmer_feedback = $request->feedback ?? null;
        $consultation->farmer_rating = $request->rating ?? null;
        $consultation->save();

        return redirect()->route('farmer.consultations.history')
            ->with('message', 'Consultation completed successfully.');
    }

    /**
     * Show consultation history.
     */
    public function history()
    {
        $consultations = Consultation::where('farmer_id', Auth::user()->farmer->id)
            ->with('doctor.user')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Farmer/Consultation/History', [
            'consultations' => $consultations,
        ]);
    }
}