<?php

namespace App\Services;

use Midtrans\Config;
use Midtrans\Snap;
use App\Models\Consultation;
use Illuminate\Support\Facades\Log;
use Exception;

class MidtransService
{
    public function __construct()
    {
        // Konfigurasi Midtrans
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized = config('midtrans.sanitize');
        Config::$is3ds = config('midtrans.is_3ds');
        Config::$appendNotifUrl = "";
        Config::$overrideNotifUrl = "";
        Config::$paymentIdempotencyKey = "";
    }

    /**
     * Membuat token snap untuk pembayaran konsultasi
     * 
     * @param Consultation $consultation
     * @return string
     */
    // Verifikasi kode ini sudah ada di MidtransService.php dan berfungsi dengan benar
    public function createConsultationSnapToken(Consultation $consultation)
    {
        // Buat order ID unik
        $orderId = 'CONS-' . $consultation->id . '-' . time();
        
        // Set parameter untuk Snap API
        $params = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => (int) $consultation->fee,
            ],
            'customer_details' => [
                'first_name' => $consultation->farmer->user->name,
                'email' => $consultation->farmer->user->email,
            ],
            'item_details' => [
                [
                    'id' => 'CONS-' . $consultation->id,
                    'price' => (int) $consultation->fee,
                    'quantity' => 1,
                    'name' => 'Konsultasi ' . ucfirst($consultation->type) . ' dengan ' . $consultation->doctor->user->name,
                ]
            ],
        ];
        
        try {
            // Inisialisasi Snap API
            \Midtrans\Config::$serverKey = config('midtrans.server_key');
            \Midtrans\Config::$isProduction = config('midtrans.is_production');
            \Midtrans\Config::$isSanitized = true;
            \Midtrans\Config::$is3ds = true;
            
            // Buat Snap Token
            $snapToken = \Midtrans\Snap::getSnapToken($params);
            
            // Update consultation dengan order ID dan snap token
            $consultation->midtrans_order_id = $orderId;
            $consultation->midtrans_snap_token = $snapToken;
            $consultation->save();
            
            return $snapToken;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Menghandle callback dari Midtrans
     * 
     * @param array $notification
     * @return void
     */
/**
 * Handle consultation payment notification from Midtrans
 * Tambahkan pada file MidtransService.php
 */
// Di dalam MidtransService.php
    public function handleConsultationPaymentNotification($notification)
    {
        // Ambil order_id yang berisi ID konsultasi
        $orderId = $notification['order_id'] ?? null;
        
        // Extrak ID konsultasi dari order ID (CONS-{id})
        $consultationId = substr($orderId, 5);
        
        // Ambil status transaksi
        $transactionStatus = $notification['transaction_status'] ?? null;
        
        $consultation = Consultation::find($consultationId);
        
        if (!$consultation) {
            \Log::error('Consultation not found: ' . $consultationId);
            return;
        }
        
        // Update status konsultasi berdasarkan status pembayaran
        if ($transactionStatus == 'settlement' || $transactionStatus == 'capture') {
            $consultation->is_paid = 1;
            $consultation->payment_status = 'paid';
            
            // Untuk konsultasi chat, langsung set status menjadi active
            if ($consultation->type === 'chat') {
                $consultation->status = 'active';
            }
            
            $consultation->save();
            
            \Log::info('Payment success for consultation ID: ' . $consultationId);
        }
    }

    /**
     * Menandai konsultasi sebagai sudah dibayar
     * 
     * @param Consultation $consultation
     * @return void
     */
    private function markConsultationAsPaid(Consultation $consultation)
    {
        $consultation->is_paid = 1;

        // Jika tipe konsultasi adalah chat, langsung set status menjadi active
        if ($consultation->type === 'chat') {
            $consultation->status = 'active';
        }

        $consultation->payment_status = 'paid';
        $consultation->save();
    }
}
