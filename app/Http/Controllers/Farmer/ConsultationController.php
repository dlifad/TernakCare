<?php

namespace App\Http\Controllers\Farmer;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\Doctor;
use App\Models\Chat;
use App\Events\NewChatMessage;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ConsultationController extends Controller
{
    protected $midtransService;

    public function __construct(MidtransService $midtransService)
    {
        $this->midtransService = $midtransService;
    }

    public function index(Request $request)
    {
        $frontendType = $request->input('type', 'chat');
        $allowedTypes = ['chat', 'video_call', 'visit'];

        if (!in_array($frontendType, $allowedTypes)) {
            $frontendType = 'chat';
        }

        $doctors = Doctor::whereHas('user', fn($q) => $q->where('is_active', true))
            ->where(fn($query) => match ($frontendType) {
                'chat' => $query->where('chat_service_active', true),
                'video_call' => $query->where('video_call_service_active', true),
                'visit' => $query->where('home_visit_service_active', true),
            })->where('is_available_online', true)
            ->with('user:id,name,email,photo_url')
            ->get()
            ->map(fn($doctor) => [
                'id' => $doctor->id,
                'name' => $doctor->user->name,
                'profile_photo_url' => $doctor->user->photo_url
                    ? asset('storage/' . $doctor->user->photo_url)
                    : asset('storage/images/default-avatar.png'),
                'experience' => $doctor->years_experience,
                'rating' => 5.0,
                'chat_fee' => $doctor->chat_service_fee ?? 0,
                'video_call_fee' => $doctor->video_call_service_fee ?? 0,
                'visit_fee' => $doctor->home_visit_service_fee ?? 0,
            ]);

        $upcomingConsultations = Consultation::where('farmer_id', Auth::user()->farmer->id)
            ->whereIn('status', ['approved'])
            ->where(fn($query) => $query->where('type', 'chat')
                ->orWhere(fn($subquery) => $subquery->whereIn('type', ['video_call', 'visit'])
                    ->where(fn($q) => $q->whereNull('schedule')->orWhere('schedule', '>=', now()))))
            ->with('doctor.user:id,name,photo_url')
            ->select('id', 'doctor_id', 'type', 'status', 'schedule')
            ->orderBy('schedule')
            ->take(5)
            ->get()
            ->map(fn($consultation) => [
                'id' => $consultation->id,
                'doctor' => [
                    'id' => $consultation->doctor->id,
                    'name' => $consultation->doctor->user->name,
                    'profile_photo_url' => $consultation->doctor->user->photo_url
                        ? asset('storage/' . $consultation->doctor->user->photo_url)
                        : asset('storage/images/default-avatar.png'),
                ],
                'type' => $consultation->type,
                'status' => $consultation->status,
                'scheduled_at' => $consultation->schedule,
            ]);

        return Inertia::render('Farmer/Consultation/Index', [
            'doctors' => $doctors,
            'upcomingConsultations' => $upcomingConsultations,
            'consultationType' => $frontendType,
        ]);
    }

    public function showDoctor($id)
    {
        $doctor = Doctor::with('user')->findOrFail($id);

        return Inertia::render('Farmer/Consultation/Doctor', [
            'doctor' => $doctor,
        ]);
    }

    public function store(Request $request)
    {
        $rules = [
            'doctor_id' => 'required|exists:doctors,id',
            'type' => 'required|in:chat,video_call,visit',
            'animal_type' => 'required|string|max:100',
            'symptoms' => 'required|string|max:500',
            'description' => 'nullable|string|max:1000',
        ];

        if ($request->type !== 'chat') {
            $rules += [
                'scheduled_date' => 'required|date|after_or_equal:today',
                'scheduled_time' => 'required',
            ];
        }

        if ($request->type === 'visit') {
            $rules['address'] = 'required|string|max:255';
        }

        $request->validate($rules);

        $schedule = ($request->type !== 'chat')
            ? $request->scheduled_date . ' ' . $request->scheduled_time . ':00'
            : null;

        $doctor = Doctor::findOrFail($request->doctor_id);
        $fee = match ($request->type) {
            'chat' => $doctor->chat_service_fee,
            'video_call' => $doctor->video_call_service_fee,
            'visit' => $doctor->home_visit_service_fee,
        };

        $data = [
            'farmer_id' => Auth::user()->farmer->id,
            'doctor_id' => $request->doctor_id,
            'type' => $request->type,
            'status' => 'pending',
            'issue' => $request->symptoms,
            'animal_type' => $request->animal_type,
            'description' => $request->description,
            'fee' => $fee,
            'is_paid' => 0,
            'schedule' => $schedule,
            'location' => $request->type === 'visit' ? $request->address : null,
        ];

        $consultation = Consultation::create($data);

        return redirect()->route('farmer.consultations.show', $consultation->id)
            ->with('message', 'Permintaan konsultasi berhasil dikirim.');
    }

    public function payment($id)
    {
        $consultation = Consultation::with('doctor.user')
            ->where('farmer_id', Auth::user()->farmer->id)
            ->findOrFail($id);

        if ($consultation->status !== 'approved') {
            return back()->with('error', 'Konsultasi belum disetujui oleh dokter.');
        }

        if ($consultation->is_paid) {
            return back()->with('error', 'Konsultasi ini sudah dibayar.');
        }

        if (!$consultation->midtrans_snap_token) {
            $snapToken = $this->midtransService->createConsultationSnapToken($consultation);

            if (!$snapToken) {
                \Log::error('Gagal membuat snap token konsultasi ID: ' . $consultation->id);
                return back()->with('error', 'Gagal membuat token pembayaran.');
            }
        }

        $consultation->refresh();

        return Inertia::render('Farmer/Consultation/Payment', [
            'consultation' => [
                'id' => $consultation->id,
                'doctor' => ['name' => $consultation->doctor->user->name],
                'type' => $consultation->type,
                'fee' => $consultation->fee,
                'snapToken' => $consultation->midtrans_snap_token,
            ],
            'clientKey' => config('midtrans.client_key'),
        ]);
    }

    public function handlePaymentNotification(Request $request)
    {
        $this->midtransService->handleConsultationPaymentNotification($request->all());
        return response('OK', 200);
    }

    public function updatePayment(Request $request, $id)
    {
        $consultation = Consultation::where('farmer_id', Auth::user()->farmer->id)
            ->findOrFail($id);

        $status = $request->input('status');
        $consultation->payment_status = $status;
        $consultation->payment_details = json_encode($request->input('payment_data'));
        $consultation->is_paid = $status === 'success' || $status === 'paid';
        $consultation->save();

        return redirect()->route('farmer.consultations.show', $consultation->id)
            ->with('message', 'Status pembayaran berhasil diperbarui.');
    }

    public function paymentFinish(Request $request, $id)
    {
        $consultation = Consultation::where('farmer_id', Auth::user()->farmer->id)->findOrFail($id);

        for ($i = 0; $i < 3; $i++) {
            sleep(1);
            $consultation->refresh();
            if ($consultation->is_paid) break;
        }

        if (!$consultation->is_paid && $consultation->payment_status === 'paid') {
            $consultation->is_paid = 1;
            $consultation->save();
        }

        return redirect()->route('farmer.consultations.show', $consultation->id)
            ->with($consultation->is_paid ? 'message' : 'info',
                $consultation->is_paid ? 'Pembayaran berhasil dikonfirmasi.' :
                'Status pembayaran: ' . ($consultation->payment_status ?? 'pending') . '. Mohon tunggu konfirmasi.');
    }


    public function show($id)
    {
        $consultation = Consultation::with(['doctor.user', 'chats.sender']) // Eager load chats.sender
            ->where('farmer_id', Auth::user()->farmer->id)
            ->findOrFail($id);

        // Untuk halaman Show, yang juga akan menjadi halaman chat
        $canChat = $consultation->type === 'chat' &&
                   $consultation->status === 'approved' && // atau 'active'
                   ($consultation->fee == 0 || $consultation->is_paid) && // Gratis atau sudah bayar
                   !$consultation->is_completed;

        return Inertia::render('Farmer/Consultation/Show', [
            'consultation' => [
                'id' => $consultation->id,
                'doctor' => [
                    'id' => $consultation->doctor->id,
                    'user' => [
                        'id' => $consultation->doctor->user->id, // ID User dokter
                        'name' => $consultation->doctor->user->name,
                        'profile_photo_url' => $consultation->doctor->user->photo_url
                            ? asset('storage/' . $consultation->doctor->user->photo_url)
                            : asset('storage/images/default-avatar.png'),
                    ]
                ],
                'type' => $consultation->type,
                'status' => $consultation->status,
                'animal_type' => $consultation->animal_type,
                'issue' => $consultation->issue,
                'description' => $consultation->description,
                'fee' => $consultation->fee,
                'schedule' => $consultation->schedule, // Format di frontend jika perlu
                'location' => $consultation->location,
                'created_at' => $consultation->created_at, // Format di frontend jika perlu
                'is_paid' => (bool) $consultation->is_paid,
                'is_completed' => (bool) $consultation->is_completed,
                'can_chat' => $canChat, // Flag untuk menampilkan UI chat di frontend
                'chats' => $consultation->chats->map(function ($chat) {
                    return [
                        'id' => $chat->id,
                        'message' => $chat->message,
                        'sender_id' => $chat->sender_id,
                        'sender_type' => $chat->sender_type,
                        'created_at' => $chat->created_at->toIso8601String(),
                        'created_at_formatted' => $chat->created_at->format('d M Y H:i'),
                        // 'sender_name' => $chat->sender->name, // Opsional
                    ];
                })
            ]
        ]);
    }

    // Method untuk farmer mengirim pesan
    public function sendMessage(Request $request, Consultation $consultation)
    {
        if ($consultation->farmer_id !== Auth::user()->farmer->id) {
            abort(403, 'Unauthorized action.');
        }

        if ($consultation->type !== 'chat' || !in_array($consultation->status, ['approved', 'active'])) {
             return back()->with('error', 'Tidak dapat mengirim pesan. Konsultasi belum disetujui atau bukan tipe chat.');
        }

        if ($consultation->fee > 0 && !$consultation->is_paid) {
            return back()->with('error', 'Anda belum menyelesaikan pembayaran untuk konsultasi ini.');
        }

         if ($consultation->is_completed) {
            return back()->with('error', 'Konsultasi sudah selesai.');
        }

        $validated = $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $chat = Chat::create([
            'consultation_id' => $consultation->id,
            'sender_type' => 'farmer', // Tipe pengirim adalah farmer
            'sender_id' => Auth::id(),   // ID User farmer yang sedang login
            'message' => $validated['message'],
        ]);

        $chat->load('sender');
        broadcast(new NewChatMessage($chat, $consultation))->toOthers();

        return back()->with('message', 'Pesan terkirim!');
    }

    // Jika Anda memiliki route `farmer.consultations.chat` yang mengarah ke method `chat()`
    // dan itu berbeda dari `show()`, Anda bisa membuat method `chat()` di sini.
    // Namun, lebih sederhana jika halaman `Show.jsx` juga berfungsi sebagai halaman chat.
    // Jika demikian, route `farmer.consultations.chat` bisa saja tidak diperlukan atau
    // bisa juga mengarah ke method `show()` ini.
    //
    // public function chat($id)
    // {
    //     // Logika mirip dengan show(), mungkin dengan view/props berbeda
    //     // ...
    //     // return Inertia::render('Farmer/Consultation/ChatPage', [...]);
    // }
    // ...
}

