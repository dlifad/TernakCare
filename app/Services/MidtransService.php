<?php

namespace App\Services;

use Midtrans\Config;
use Midtrans\Snap;
use App\Models\Consultation;
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
    public function createConsultationSnapToken(Consultation $consultation)
    {
        $orderId = 'CONS-' . $consultation->id . '-' . time();

        // Menyiapkan item detail
        $itemDetails = [
            [
                'id' => 'CONS-' . $consultation->id,
                'price' => $consultation->fee,
                'quantity' => 1,
                'name' => 'Konsultasi ' . ucfirst($consultation->type) . ' dengan ' . $consultation->doctor->user->name,
                'category' => 'Layanan Konsultasi',
                'merchant_name' => 'TernakCare',
            ]
        ];

        // Menyiapkan detail pelanggan
        $customerDetails = [
            'first_name' => $consultation->farmer->user->name,
            'email' => $consultation->farmer->user->email,
            'phone' => $consultation->farmer->user->phone ?? '',
        ];

        $params = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => $consultation->fee,
            ],
            'item_details' => $itemDetails,
            'customer_details' => $customerDetails,
            'callbacks' => [
                'finish' => route('farmer.consultations.show', $consultation->id),
            ],
        ];

        try {
            // Buat token snap
            $snapToken = Snap::getSnapToken($params);

            // Update consultation dengan order ID Midtrans
            $consultation->update([
                'midtrans_order_id' => $orderId,
                'midtrans_snap_token' => $snapToken,
            ]);

            return $snapToken;
        } catch (Exception $e) {
            report($e);
            return null;
        }
    }

    /**
     * Menghandle callback dari Midtrans
     * 
     * @param array $notification
     * @return void
     */
    public function handleConsultationPaymentNotification(array $notification)
    {
        $orderId = $notification['order_id'];
        $transactionStatus = $notification['transaction_status'];
        $fraudStatus = isset($notification['fraud_status']) ? $notification['fraud_status'] : null;

        // Mendapatkan ID konsultasi dari order ID
        $consultationId = null;
        if (preg_match('/CONS-(\d+)-\d+/', $orderId, $matches)) {
            $consultationId = $matches[1];
        }

        if (!$consultationId) {
            return;
        }

        $consultation = Consultation::find($consultationId);

        if (!$consultation) {
            return;
        }

        // Handle berbagai status pembayaran
        if ($transactionStatus == 'capture') {
            if ($fraudStatus == 'challenge') {
                // Tidak mengubah status karena perlu review manual
                $consultation->payment_status = 'challenge';
            } else if ($fraudStatus == 'accept') {
                // Pembayaran sukses
                $this->markConsultationAsPaid($consultation);
            }
        } else if ($transactionStatus == 'settlement') {
            // Pembayaran sukses
            $this->markConsultationAsPaid($consultation);
        } else if (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
            // Pembayaran gagal
            $consultation->payment_status = 'failed';
            $consultation->save();
        } else if ($transactionStatus == 'pending') {
            // Pembayaran tertunda
            $consultation->payment_status = 'pending';
            $consultation->save();
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
