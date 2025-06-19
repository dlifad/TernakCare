<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\Chat;
use App\Events\NewChatMessage;
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
        // Eager load relasi 'chats' dan 'sender' di dalam chats
        $consultation = Consultation::with(['farmer.user', 'chats.sender'])->findOrFail($id);

        if ($consultation->doctor_id !== Auth::user()->doctor->id) {
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('Doctor/Consultations/Show', [
            'consultation' => [
                'id' => $consultation->id,
                'patient_name' => $consultation->farmer->user->name,
                // Kirim ID user farmer untuk perbandingan di frontend jika perlu
                'farmer_user_id' => $consultation->farmer->user->id,
                'status' => $consultation->status,
                'date' => $consultation->schedule ? $consultation->schedule->format('d M Y') : '-',
                'time' => $consultation->schedule ? $consultation->schedule->format('H:i') . ' - ' .
                    $consultation->schedule->addHour()->format('H:i') : '-', // Perbaiki jika format salah
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
                        'sender_id' => $chat->sender_id, // ID User pengirim
                        'sender_type' => $chat->sender_type,
                        'created_at' => $chat->created_at->toIso8601String(),
                        'created_at_formatted' => $chat->created_at->format('d M Y H:i'),
                        // 'sender_name' => $chat->sender->name, // Opsional
                    ];
                })
            ]
        ]);
    }

    public function sendMessage(Request $request, Consultation $consultation)
    {
        if ($consultation->doctor_id !== Auth::user()->doctor->id) {
            abort(403, 'Unauthorized action.');
        }

        // Pastikan konsultasi adalah tipe 'chat' dan statusnya 'approved' atau 'active'
        if ($consultation->type !== 'chat' || !in_array($consultation->status, ['approved', 'active'])) {
            return back()->with('error', 'Tidak dapat mengirim pesan. Konsultasi belum disetujui atau bukan tipe chat.');
        }

        // Tambahan: Cek apakah konsultasi sudah dibayar jika ada biaya
        if ($consultation->fee > 0 && !$consultation->is_paid) {
            return back()->with('error', 'Peternak belum menyelesaikan pembayaran untuk konsultasi ini.');
        }

        // Validasi request
        $validated = $request->validate([
            'message' => 'required|string|max:1000', // Batasi panjang pesan
        ]);

        // Buat chat baru
        $chat = Chat::create([
            'consultation_id' => $consultation->id,
            'sender_type' => 'doctor', // Tipe pengirim adalah dokter
            'sender_id' => Auth::id(),   // ID User dokter yang sedang login
            'message' => $validated['message'],
        ]);

        // Load relasi sender (User) agar bisa diakses di event (jika dibutuhkan)
        $chat->load('sender');

        // Broadcast event NewChatMessage
        // toOthers() agar event tidak dikirim kembali ke tab browser pengirim sendiri
        broadcast(new NewChatMessage($chat, $consultation))->toOthers();

        // Redirect kembali dengan pesan sukses
        return back()->with('message', 'Pesan terkirim!');
        // Alternatif: return response()->json($chat->load('sender')); jika ingin respons JSON
    }
    // ...

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
