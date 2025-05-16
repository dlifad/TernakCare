<?php

namespace App\Http\Controllers\Farmer;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\Transaction;
use App\Models\Farmer;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ActivityController extends Controller
{
    /**
     * Mendapatkan peternak yang sedang login.
     */
    private function getAuthenticatedFarmer()
    {
        return Farmer::where('user_id', Auth::id())->first();
    }

    /**
     * Tampilkan riwayat aktivitas peternak (konsultasi & transaksi).
     */
    public function index()
    {
        $farmer = $this->getAuthenticatedFarmer();

        if (!$farmer) {
            return redirect()->route('farmer.home')->with('error', 'Data peternak tidak ditemukan');
        }

        $consultations = Consultation::where('farmer_id', $farmer->id)
            ->with(['doctor.user'])
            ->latest()
            ->get();

        $transactions = Transaction::where('farmer_id', $farmer->id)
            ->with(['items.product.shop.user'])
            ->latest()
            ->get();

        return Inertia::render('Farmer/Activity/Index', [
            'consultations' => $consultations,
            'transactions' => $transactions,
        ]);
    }

    /**
     * Detail konsultasi peternak.
     */
    public function showConsultation($id)
    {
        $farmer = $this->getAuthenticatedFarmer();

        if (!$farmer) {
            return redirect()->route('farmer.home')->with('error', 'Data peternak tidak ditemukan');
        }

        $consultation = Consultation::where('id', $id)
            ->where('farmer_id', $farmer->id)
            ->with([
                'doctor.user',
                'doctor.specialization',
                'messages' => fn($query) => $query->orderBy('created_at', 'asc'),
                'messages.sender',
                'attachments',
            ])
            ->firstOrFail();

        return Inertia::render('Farmer/Activity/ConsultationDetail', [
            'consultation' => $consultation,
        ]);
    }

    /**
     * Detail transaksi peternak.
     */
    public function showTransaction($id)
    {
        $farmer = $this->getAuthenticatedFarmer();

        if (!$farmer) {
            return redirect()->route('farmer.home')->with('error', 'Data peternak tidak ditemukan');
        }

        $transaction = Transaction::where('id', $id)
            ->where('farmer_id', $farmer->id)
            ->with([
                'items.product.shop.user',
                'items.product.images',
            ])
            ->firstOrFail();


        return Inertia::render('Farmer/Activity/TransactionDetail', [
            'transaction' => $transaction,
        ]);
    }
}
