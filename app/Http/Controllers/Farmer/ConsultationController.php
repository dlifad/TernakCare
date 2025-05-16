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
    public function index(Request $request)
    {
        // Tangkap parameter tipe konsultasi (default: chat)
        $consultationType = $request->input('type', 'chat');
        
        // Validasi tipe konsultasi
        if (!in_array($consultationType, ['chat', 'video', 'visit'])) {
            $consultationType = 'chat';
        }
        
        // Ambil dokter yang aktif berdasarkan tipe konsultasi yang dipilih
        $doctors = Doctor::whereHas('user', function ($query) {
            $query->where('is_active', true);
            // Hapus kondisi status karena tidak terlihat di gambar database
            // $query->where('status', 'active');
        })
        ->where(function($query) use ($consultationType) {
            // Sesuaikan dengan nama kolom yang terlihat di database
            if ($consultationType === 'chat') {
                $query->where('chat_service_active', true);
                // Gunakan is_available_online jika untuk chat
                $query->where('is_available_online', true);
            } elseif ($consultationType === 'video') {
                $query->where('video_call_service_active', true);
                // Gunakan is_available_online jika untuk video call
                $query->where('is_available_online', true);
            } elseif ($consultationType === 'visit') {
                $query->where('home_visit_service_active', true);
                // Untuk kunjungan, cek apakah ada jam kerja yang tersedia
                $query->where('is_available_online', true);
            }
        })
        ->with(['user' => function($query) {
            $query->select('id', 'name', 'email');
        }])
        ->get()
        ->map(function($doctor) {
            // Format data untuk frontend sesuai dengan kolom di database
            return [
                'id' => $doctor->id,
                'name' => $doctor->user->name,
                'profile_photo_url' => $doctor->user->photo_url
                    ? asset('storage/' . $doctor->user->photo_url)
                    : asset('storage/images/default-avatar.png'),

                'experience' => $doctor->years_experience,
                'rating' => 5.0, // Nilai default karena tidak ada di tabel
                'chat_fee' => $doctor->chat_service_fee ?? 0,
                'video_fee' => $doctor->video_call_service_fee ?? 0,
                'visit_fee' => $doctor->home_visit_service_fee ?? 0,
            ];
        });

        // Ambil konsultasi yang akan datang untuk ditampilkan
        $upcomingConsultations = Consultation::where('farmer_id', Auth::user()->farmer->id)
            ->whereIn('status', ['approved', 'active'])
            ->where(function($query) {
                $query->where('type', 'chat') // Tambahkan kondisi untuk chat
                    ->orWhere(function($subquery) {
                        $subquery->whereIn('type', ['video', 'visit'])
                                ->where(function($dateQuery) {
                                    $dateQuery->whereNull('schedule')
                                            ->orWhere('schedule', '>=', now());
                                });
                    });
            })
            ->with(['doctor.user' => function($query) {
                $query->select('id', 'name', 'photo_url'); // atau 'photo_path' tergantung yang Anda pakai
            }])
            ->select('id', 'doctor_id', 'type', 'status', 'schedule')
            ->orderBy('schedule')
            ->take(5)
            ->get()
            ->map(function($consultation) {
                return [
                    'id' => $consultation->id,
                    'doctor' => [
                        'id' => $consultation->doctor->id,
                        'name' => $consultation->doctor->user->name,
                        'profile_photo_url' => $consultation->doctor->user->profile_photo ? 
                            asset('storage/' . $consultation->doctor->user->profile_photo) : 
                            asset('storage/images/default-avatar.png'),
                    ],
                    'type' => $consultation->type,
                    'status' => $consultation->status,
                    'scheduled_at' => $consultation->schedule,
                ];
            });

        return Inertia::render('Farmer/Consultation/Index', [
            'doctors' => $doctors,
            'upcomingConsultations' => $upcomingConsultations,
            'consultationType' => $consultationType,
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
        // Validasi input
        $validationRules = [
            'doctor_id' => 'required|exists:doctors,id',
            'type' => 'required|in:chat,video,visit',
            'animal_type' => 'required|string|max:100',
            'symptoms' => 'required|string|max:500',
            'description' => 'nullable|string|max:1000',
        ];
        
        // Tambahkan validasi jadwal hanya untuk video dan visit
        if ($request->type != 'chat') {
            $validationRules['scheduled_date'] = 'required|date|after_or_equal:today';
            $validationRules['scheduled_time'] = 'required';
        }
        
        // Tambahkan validasi alamat hanya untuk visit
        if ($request->type == 'visit') {
            $validationRules['address'] = 'required|string|max:255';
        }
        
        $request->validate($validationRules);

        // Gabungkan tanggal dan waktu hanya jika bukan tipe chat
        $scheduledDateTime = null;
        if ($request->type != 'chat' && $request->scheduled_date && $request->scheduled_time) {
            $scheduledDateTime = $request->scheduled_date . ' ' . $request->scheduled_time . ':00';
        }

        // Ambil data dokter untuk mendapatkan biaya konsultasi
        $doctor = Doctor::findOrFail($request->doctor_id);
        
        // Tentukan fee berdasarkan tipe konsultasi
        $fee = 0;
        if ($request->type === 'chat') {
            $fee = $doctor->chat_service_fee;
        } elseif ($request->type === 'video') {
            $fee = $doctor->video_call_service_fee;
        } elseif ($request->type === 'visit') {
            $fee = $doctor->home_visit_service_fee;
        }

        // Buat array data untuk membuat konsultasi baru
        $consultationData = [
            'farmer_id' => Auth::user()->farmer->id,
            'doctor_id' => $request->doctor_id,
            'type' => $request->type,
            'status' => 'pending',
            'issue' => $request->symptoms, // Gunakan symptoms sebagai issue
            'animal_type' => $request->animal_type,
            'description' => $request->description ?? null,
            'fee' => $fee,
            'is_paid' => 0,
        ];
        
        // Tambahkan schedule hanya jika bukan tipe chat
        if ($request->type != 'chat') {
            $consultationData['schedule'] = $scheduledDateTime;
        }
        
        // Tambahkan lokasi hanya jika tipe visit
        if ($request->type == 'visit') {
            $consultationData['location'] = $request->address;
        }
        
        // Buat konsultasi baru menggunakan Eloquent ORM
        $consultation = Consultation::create($consultationData);

        // Redirect menggunakan Inertia dengan pesan sukses
        return redirect()->route('farmer.consultations.show', $consultation->id)
            ->with('message', 'Permintaan konsultasi berhasil dikirim.');
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
                'chats' => $consultation->chats->map(function($chat) {
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
     * Process payment for consultation
     */
    public function payment($id)
    {
        $consultation = Consultation::where('farmer_id', Auth::user()->farmer->id)
            ->findOrFail($id);
        
        // Validasi status konsultasi
        if ($consultation->status !== 'approved') {
            return back()->with('error', 'Konsultasi belum disetujui oleh dokter.');
        }
        
        // Validasi jika sudah dibayar
        if ($consultation->is_paid) {
            return back()->with('error', 'Konsultasi ini sudah dibayar.');
        }
        
        return Inertia::render('Farmer/Consultation/Payment', [
            'consultation' => [
                'id' => $consultation->id,
                'doctor' => [
                    'name' => $consultation->doctor->user->name
                ],
                'type' => $consultation->type,
                'fee' => $consultation->fee
            ]
        ]);
    }

    /**
     * Process payment confirmation
     */
    public function confirmPayment(Request $request, $id)
    {
        $consultation = Consultation::where('farmer_id', Auth::user()->farmer->id)
            ->findOrFail($id);
        
        // Validasi status konsultasi
        if ($consultation->status !== 'approved') {
            return back()->with('error', 'Konsultasi belum disetujui oleh dokter.');
        }
        
        // Validasi jika sudah dibayar
        if ($consultation->is_paid) {
            return back()->with('error', 'Konsultasi ini sudah dibayar.');
        }
        
        // Di sini seharusnya ada proses pembayaran dengan payment gateway
        // Untuk sementara, kita anggap pembayaran berhasil
        
        // Update status pembayaran
        $consultation->is_paid = 1;
        
        // Untuk konsultasi chat, langsung set status menjadi active
        if ($consultation->type === 'chat') {
            $consultation->status = 'active';
        }
        
        $consultation->save();
        
        return redirect()->route('farmer.consultations.show', $consultation->id)
            ->with('message', 'Pembayaran berhasil dikonfirmasi.');
    }

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
                'chats' => $consultation->chats->map(function($chat) {
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