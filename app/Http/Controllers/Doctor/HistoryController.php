<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;


class HistoryController extends Controller
{
    /**
     * Display a listing of the completed consultations.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $query = Consultation::where('doctor_id', Auth::user()->doctor->id)
            ->where('is_completed', true)
            ->with('farmer.user');
        
        // Filter by consultation type if provided
        if ($request->has('type') && in_array($request->type, ['chat', 'video', 'visit'])) {
            $query->where('type', $request->type);
        }
        
        // Filter by date range if provided
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('created_at', [$request->start_date, $request->end_date]);
        }
        
        $completedConsultations = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();
        
        // Get consultation type statistics
        $chatCount = Consultation::where('doctor_id', Auth::user()->doctor->id)
            ->where('is_completed', true)
            ->where('type', 'chat')
            ->count();
            
        $videoCount = Consultation::where('doctor_id', Auth::user()->doctor->id)
            ->where('is_completed', true)
            ->where('type', 'video')
            ->count();
            
        $visitCount = Consultation::where('doctor_id', Auth::user()->doctor->id)
            ->where('is_completed', true)
            ->where('type', 'visit')
            ->count();
        
        return Inertia::render('Doctor/History/Index', [
            'completedConsultations' => $completedConsultations,
            'filters' => $request->only(['type', 'start_date', 'end_date']),
            'statistics' => [
                'chat' => $chatCount,
                'video' => $videoCount,
                'visit' => $visitCount,
            ]
        ]);
    }

    /**
     * Display the specified consultation history.
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
            $chats = $consultation->chats()->orderBy('created_at', 'asc')->get();
        }
        
        return Inertia::render('Doctor/History/Show', [
            'consultation' => $consultation,
            'chats' => $chats
        ]);
    }

    /**
     * Download consultation records.
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
        
        $consultations = Consultation::where('doctor_id', Auth::user()->doctor->id)
            ->where('is_completed', true)
            ->whereBetween('created_at', [$request->start_date, $request->end_date])
            ->with('farmer.user')
            ->get();
        
        // Logic for exporting consultation records - this would depend on how you want to handle exports
        // For simplicity, this is a placeholder
        $fileName = 'consultations_' . now()->format('Y-m-d') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$fileName\"",
        ];
        
        $callback = function() use($consultations) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Farmer', 'Type', 'Issue', 'Status', 'Date', 'Completed']);
            
            foreach ($consultations as $consultation) {
                fputcsv($file, [
                    $consultation->id,
                    $consultation->farmer->user->name,
                    $consultation->type,
                    $consultation->issue,
                    $consultation->status,
                    $consultation->created_at->format('Y-m-d H:i'),
                    $consultation->is_completed ? 'Yes' : 'No',
                ]);
            }
            
            fclose($file);
        };
        
        return response()->stream($callback, 200, $headers);
    }
}