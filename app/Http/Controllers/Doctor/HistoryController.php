<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class HistoryController extends Controller
{
    /**
     * Menampilkan daftar konsultasi yang telah selesai.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $query = Consultation::where('doctor_id', Auth::user()->doctor->id)
            ->where('is_completed', true)
            ->with(['farmer.user', 'chats' => function($query) {
                $query->orderBy('created_at', 'desc');
            }]);
        
        // Filter berdasarkan tipe konsultasi jika disediakan
        if ($request->has('type') && in_array($request->type, ['chat', 'video', 'visit'])) {
            // Penyesuaian untuk 'video' menjadi 'video_call' saat kueri ke database
            $type = $request->type === 'video' ? 'video_call' : $request->type;
            $query->where('type', $type);
        }
        
        // Filter berdasarkan rentang tanggal jika disediakan
        if ($request->has('start_date') && $request->has('end_date')) {
            try {
                $startDate = Carbon::parse($request->start_date)->startOfDay();
                $endDate = Carbon::parse($request->end_date)->endOfDay();
                $query->whereBetween('created_at', [$startDate, $endDate]);
            } catch (\Exception $e) {
                // Handle jika format tanggal tidak valid
            }
        }

        // Filter berdasarkan pencarian jika disediakan
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;
            $query->whereHas('farmer.user', function($q) use ($searchTerm) {
                $q->where('name', 'like', '%' . $searchTerm . '%');
            })->orWhere('animal_type', 'like', '%' . $searchTerm . '%')
              ->orWhere('issue', 'like', '%' . $searchTerm . '%');
        }
        
        $completedConsultations = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();
        
        // Konversi nilai 'video_call' menjadi 'video' untuk frontend
        $completedConsultations->through(function($consultation) {
            if ($consultation->type === 'video_call') {
                $consultation->type = 'video';
            }
            return $consultation;
        });
        
        // Hitung statistik berdasarkan tipe konsultasi
        $chatCount = Consultation::where('doctor_id', Auth::user()->doctor->id)
            ->where('is_completed', true)
            ->where('type', 'chat')
            ->count();
            
        $videoCount = Consultation::where('doctor_id', Auth::user()->doctor->id)
            ->where('is_completed', true)
            ->where('type', 'video_call') // Perhatikan penggunaan 'video_call' di database
            ->count();
            
        $visitCount = Consultation::where('doctor_id', Auth::user()->doctor->id)
            ->where('is_completed', true)
            ->where('type', 'visit')
            ->count();
        
        return Inertia::render('Doctor/History/Index', [
            'completedConsultations' => $completedConsultations,
            'filters' => $request->only(['type', 'start_date', 'end_date', 'search']),
            'statistics' => [
                'chat' => $chatCount,
                'video' => $videoCount,
                'visit' => $visitCount,
                'total' => $chatCount + $videoCount + $visitCount
            ]
        ]);
    }

    /**
     * Menampilkan detail konsultasi yang dipilih.
     *
     * @param  \App\Models\Consultation  $consultation
     * @return \Inertia\Response
     */
    public function show(Consultation $consultation)
    {
        // Periksa apakah konsultasi ini milik dokter yang sedang login
        if ($consultation->doctor_id !== Auth::user()->doctor->id) {
            abort(403, 'Aksi tidak diizinkan.');
        }
        
        // Muat data farmer dan informasi detail konsultasi
        $consultation->load([
            'farmer.user', 
            'chats' => function($query) {
                $query->orderBy('created_at', 'asc');
            }
        ]);
        
        // Konversi nilai 'video_call' menjadi 'video' untuk frontend
        if ($consultation->type === 'video_call') {
            $consultation->type = 'video';
        }
        
        // Cari konsultasi sebelumnya dari peternak yang sama (opsional)
        $previousConsultation = Consultation::where('doctor_id', Auth::user()->doctor->id)
            ->where('farmer_id', $consultation->farmer_id)
            ->where('id', '!=', $consultation->id)
            ->where('is_completed', true)
            ->orderBy('created_at', 'desc')
            ->first();
            
        // Jika ada konsultasi sebelumnya, konversi juga tipe konsultasinya
        if ($previousConsultation && $previousConsultation->type === 'video_call') {
            $previousConsultation->type = 'video';
        }
        
        return Inertia::render('Doctor/History/Show', [
            'consultation' => $consultation,
            'previousConsultation' => $previousConsultation
        ]);
    }

    /**
     * Mengunduh catatan konsultasi.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public function export(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);
        
        try {
            $startDate = Carbon::parse($request->start_date)->startOfDay();
            $endDate = Carbon::parse($request->end_date)->endOfDay();
            
            $consultations = Consultation::where('doctor_id', Auth::user()->doctor->id)
                ->where('is_completed', true)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->with('farmer.user')
                ->get();
            
            $fileName = 'konsultasi_' . now()->format('Y-m-d') . '.csv';
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"$fileName\"",
            ];
            
            $callback = function() use($consultations) {
                $file = fopen('php://output', 'w');
                fputcsv($file, ['ID', 'Peternak', 'Jenis Hewan', 'Tipe', 'Keluhan', 'Status', 'Tanggal', 'Selesai']);
                
                foreach ($consultations as $consultation) {
                    // Konversi 'video_call' menjadi 'Video Call' untuk export CSV
                    $type = $consultation->type;
                    if ($type === 'video_call') {
                        $type = 'Video Call';
                    } elseif ($type === 'chat') {
                        $type = 'Chat';
                    } elseif ($type === 'visit') {
                        $type = 'Kunjungan';
                    }
                    
                    fputcsv($file, [
                        $consultation->id,
                        $consultation->farmer->user->name,
                        $consultation->animal_type ?? '-',
                        $type,
                        $consultation->issue ?? '-',
                        $consultation->status,
                        $consultation->created_at->format('Y-m-d H:i'),
                        $consultation->is_completed ? 'Ya' : 'Tidak',
                    ]);
                }
                
                fclose($file);
            };
            
            return response()->stream($callback, 200, $headers);
        } catch (\Exception $e) {
            return back()->withErrors(['message' => 'Terjadi kesalahan saat mengekspor data: ' . $e->getMessage()]);
        }
    }
}