<?php

namespace App\Http\Controllers\Farmer;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\Doctor;
use App\Models\Chat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Services\MidtransService;

class ConsultationController extends Controller
{
    public function index(Request $request)
    {
        $frontendType = $request->input('type', 'chat');

        // Validasi tipe frontend
        $allowedTypes = ['chat', 'video_call', 'visit'];
        if (!in_array($frontendType, $allowedTypes)) {
            $frontendType = 'chat';
        }

        // Query dokter sesuai tipe layanan
        $doctors = Doctor::whereHas(
            'user',
            fn($q) =>
            $q->where('is_active', true)
        )
            ->where(fn($query) => match ($frontendType) {
                'chat' => $query->where('chat_service_active', true)
                    ->where('is_available_online', true),
                'video_call' => $query->where('video_call_service_active', true)
                    ->where('is_available_online', true),
                'visit' => $query->where('home_visit_service_active', true)
                    ->where('is_available_online', true),
            })
            ->with(['user:id,name,email,photo_url']) // pastikan `photo_url` dimuat
            ->get()
            ->map(function ($doctor) use ($frontendType) {
                // $fee = match ($frontendType) {
                //     'chat' => $doctor->chat_service_fee,
                //     'video_call' => $doctor->video_call_service_fee,
                //     'visit' => $doctor->home_visit_service_fee,
                //     default => 0,
                // };

                return [
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
                ];
            });

        // Konsultasi mendatang
        $upcomingConsultations = Consultation::where('farmer_id', Auth::user()->farmer->id)
            ->whereIn('status', ['approved', 'active'])
            ->where(function ($query) {
                $query->where('type', 'chat')
                    ->orWhere(function ($subquery) {
                        $subquery->whereIn('type', ['video_call', 'visit'])
                            ->where(function ($q) {
                                $q->whereNull('schedule')
                                    ->orWhere('schedule', '>=', now());
                            });
                    });
            })
            ->with(['doctor.user:id,name,photo_url'])
            ->select('id', 'doctor_id', 'type', 'status', 'schedule')
            ->orderBy('schedule')
            ->take(5)
            ->get()
            ->map(function ($consultation) {
                $user = $consultation->doctor->user;
                return [
                    'id' => $consultation->id,
                    'doctor' => [
                        'id' => $consultation->doctor->id,
                        'name' => $user->name,
                        'profile_photo_url' => $user->photo_url
                            ? asset('storage/' . $user->photo_url)
                            : asset('storage/images/default-avatar.png'),
                    ],
                    'type' => $consultation->type,
                    'status' => $consultation->status,
                    'scheduled_at' => $consultation->schedule,
                ];
            });

        return Inertia::render('Farmer/Consultation/Index', [
            'doctors' => $doctors,
            'upcomingConsultations' => $upcomingConsultations,
            'consultationType' => $frontendType,
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
     * Store a new consultation request.
     */
    public function store(Request $request)
    {
        // Validasi tipe sesuai database
        $validationRules = [
            'doctor_id' => 'required|exists:doctors,id',
            'type' => 'required|in:chat,video_call,visit',
            'animal_type' => 'required|string|max:100',
            'symptoms' => 'required|string|max:500',
            'description' => 'nullable|string|max:1000',
        ];

        if ($request->type != 'chat') {
            $validationRules['scheduled_date'] = 'required|date|after_or_equal:today';
            $validationRules['scheduled_time'] = 'required';
        }

        if ($request->type == 'visit') {
            $validationRules['address'] = 'required|string|max:255';
        }

        $request->validate($validationRules);

        $scheduledDateTime = null;
        if ($request->type != 'chat' && $request->scheduled_date && $request->scheduled_time) {
            $scheduledDateTime = $request->scheduled_date . ' ' . $request->scheduled_time . ':00';
        }

        $doctor = Doctor::findOrFail($request->doctor_id);

        // Tentukan fee sesuai tipe
        $fee = 0;
        if ($request->type === 'chat') {
            $fee = $doctor->chat_service_fee;
        } elseif ($request->type === 'video_call') {
            $fee = $doctor->video_call_service_fee;
        } elseif ($request->type === 'visit') {
            $fee = $doctor->home_visit_service_fee;
        }

        $consultationData = [
            'farmer_id' => Auth::user()->farmer->id,
            'doctor_id' => $request->doctor_id,
            'type' => $request->type, // langsung simpan tanpa map
            'status' => 'pending',
            'issue' => $request->symptoms,
            'animal_type' => $request->animal_type,
            'description' => $request->description ?? null,
            'fee' => $fee,
            'is_paid' => 0,
        ];

        if ($request->type != 'chat') {
            $consultationData['schedule'] = $scheduledDateTime;
        }

        if ($request->type == 'visit') {
            $consultationData['location'] = $request->address;
        }

        $consultation = Consultation::create($consultationData);

        return redirect()->route('farmer.consultations.show', $consultation->id)
            ->with('message', 'Permintaan konsultasi berhasil dikirim.');
    }


    protected $midtransService;

    public function __construct(MidtransService $midtransService)
    {
        $this->midtransService = $midtransService;
    }

    /**
     * Process payment for consultation
     */
    public function payment($id)
    {
        $consultation = Consultation::where('farmer_id', Auth::user()->farmer->id)
            ->with('doctor.user')
            ->findOrFail($id);

        // Validasi status konsultasi
        if ($consultation->status !== 'approved') {
            return back()->with('error', 'Konsultasi belum disetujui oleh dokter.');
        }

        // Validasi jika sudah dibayar
        if ($consultation->is_paid) {
            return back()->with('error', 'Konsultasi ini sudah dibayar.');
        }

        // Membuat snap token jika belum ada
        if (!$consultation->midtrans_snap_token) {
            $snapToken = $this->midtransService->createConsultationSnapToken($consultation);
            
            if (!$snapToken) {
                dd('GAGAL BUAT SNAP TOKEN');
                return back()->with('error', 'Gagal membuat token pembayaran. Silakan coba lagi nanti.');
            }
        }

        // Refresh untuk mendapatkan data terbaru
        $consultation->refresh();

        // SOLUSI: Pastikan data yang dikirim ke view Payment sesuai dengan yang diharapkan
        return Inertia::render('Farmer/Consultation/Payment', [
            'consultation' => [
                'id' => $consultation->id,
                'doctor' => [
                    'name' => $consultation->doctor->user->name
                ],
                'type' => $consultation->type,
                'fee' => $consultation->fee,
                'snapToken' => $consultation->midtrans_snap_token,
            ],
            'clientKey' => config('midtrans.client_key'), // ✅ pindahkan ke sini
        ]);

    }

    /**
     * Process payment notification from Midtrans
     */
    public function handlePaymentNotification(Request $request)
    {
        $notification = $request->all();
        
        $this->midtransService->handleConsultationPaymentNotification($notification);
        
        return response('OK', 200);
    }

    /**
     * Process payment confirmation from redirect URL
     */
    public function paymentFinish(Request $request, $id)
    {
        $consultation = Consultation::where('farmer_id', Auth::user()->farmer->id)
            ->findOrFail($id);

        // Refresh data dari database
        $consultation->refresh();

        // Redirect kembali ke halaman detail konsultasi
        if ($consultation->is_paid) {
            return redirect()->route('farmer.consultations.show', $consultation->id)
                ->with('message', 'Pembayaran berhasil dikonfirmasi.');
        } else {
            return redirect()->route('farmer.consultations.show', $consultation->id)
                ->with('info', 'Status pembayaran: ' . ($consultation->payment_status ?? 'pending'));
        }
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
            'is_paid' => 0,
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
            'schedule' => $request->preferred_time, // Changed from preferred_time to schedule
            'is_paid' => 0,
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
            'schedule' => $request->preferred_date, // Changed from preferred_time to schedule
            'location' => $request->address,
            'additional_info' => $request->additional_info,
            'is_paid' => 0,
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
            'consultation' => [
                'id' => $consultation->id,
                'doctor' => [
                    'id' => $consultation->doctor->id,
                    'user' => [
                        'name' => $consultation->doctor->user->name,
                        'profile_photo_url' => $consultation->doctor->user->photo_url ?
                            asset('storage/' . $consultation->doctor->user->photo_url) :
                            asset('storage/images/default-avatar.png'),
                    ]
                ],
                'type' => $consultation->type,
                'status' => $consultation->status,
                'animal_type' => $consultation->animal_type,
                'issue' => $consultation->issue,
                'description' => $consultation->description,
                'fee' => $consultation->fee,
                'schedule' => $consultation->schedule,
                'location' => $consultation->location,
                'created_at' => $consultation->created_at,
                'is_paid' => (bool) $consultation->is_paid, // Konversi integer ke boolean untuk frontend
                'chats' => $consultation->chats->map(function ($chat) {
                    return [
                        'id' => $chat->id,
                        'sender_type' => $chat->sender_type,
                        'message' => $chat->message,
                        'created_at' => $chat->created_at
                    ];
                })
            ]
        ]);
    }



    /**
     * Process payment confirmation
     */
    // public function confirmPayment(Request $request, $id)
    // {
    //     $consultation = Consultation::where('farmer_id', Auth::user()->farmer->id)
    //         ->findOrFail($id);

    //     // Validasi status konsultasi
    //     if ($consultation->status !== 'approved') {
    //         return back()->with('error', 'Konsultasi belum disetujui oleh dokter.');
    //     }

    //     // Validasi jika sudah dibayar
    //     if ($consultation->is_paid) {
    //         return back()->with('error', 'Konsultasi ini sudah dibayar.');
    //     }

    //     // Di sini seharusnya ada proses pembayaran dengan payment gateway
    //     // Untuk sementara, kita anggap pembayaran berhasil

    //     // Update status pembayaran
    //     $consultation->is_paid = 1;

    //     // Untuk konsultasi chat, langsung set status menjadi active
    //     if ($consultation->type === 'chat') {
    //         $consultation->status = 'active';
    //     }

    //     $consultation->save();

    //     return redirect()->route('farmer.consultations.show', $consultation->id)
    //         ->with('message', 'Pembayaran berhasil dikonfirmasi.');
    // }

    /**
     * Open chat interface
     */
    public function chat($id)
    {
        $consultation = Consultation::with(['doctor.user', 'chats'])
            ->where('farmer_id', Auth::user()->farmer->id)
            ->where('type', 'chat')
            ->findOrFail($id);

        // Validasi status konsultasi
        if ($consultation->status !== 'active') {
            return back()->with('error', 'Konsultasi belum aktif.');
        }

        // Validasi status pembayaran
        if (!$consultation->is_paid) {
            return back()->with('error', 'Konsultasi belum dibayar.');
        }

        return Inertia::render('Farmer/Consultation/Chat', [
            'consultation' => [
                'id' => $consultation->id,
                'doctor' => [
                    'id' => $consultation->doctor->id,
                    'name' => $consultation->doctor->user->name,
                    'profile_photo_url' => $consultation->doctor->user->photo_url ?
                        asset('storage/' . $consultation->doctor->user->photo_url) :
                        asset('storage/images/default-avatar.png'),
                ],
                'issue' => $consultation->issue,
                'animal_type' => $consultation->animal_type,
                'chats' => $consultation->chats->map(function ($chat) {
                    return [
                        'id' => $chat->id,
                        'sender_type' => $chat->sender_type,
                        'message' => $chat->message,
                        'created_at' => $chat->created_at
                    ];
                })
            ]
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

        // Validasi status konsultasi
        if ($consultation->status !== 'active') {
            return back()->with('error', 'This video call is not currently active.');
        }

        // Validasi status pembayaran
        if (!$consultation->is_paid) {
            return back()->with('error', 'Consultation fee has not been paid.');
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
