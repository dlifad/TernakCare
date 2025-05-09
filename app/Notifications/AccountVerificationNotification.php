<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountVerificationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $status;
    protected $accountType;
    protected $rejectionReason;

    /**
     * Create a new notification instance.
     *
     * @param string $status 'approved' or 'rejected'
     * @param string $accountType 'doctor' or 'shop'
     * @param string|null $rejectionReason Reason for rejection if status is 'rejected'
     */
    public function __construct($status, $accountType, $rejectionReason = null)
    {
        $this->status = $status;
        $this->accountType = $accountType;
        $this->rejectionReason = $rejectionReason;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $accountTypeLabel = $this->accountType === 'doctor' ? 'Dokter' : 'Toko';
        
        if ($this->status === 'approved') {
            return (new MailMessage)
                ->subject("Pendaftaran $accountTypeLabel Anda Disetujui")
                ->greeting("Halo {$notifiable->name},")
                ->line("Selamat! Pendaftaran $accountTypeLabel Anda pada TemakCare telah disetujui.")
                ->line("Anda sekarang dapat masuk dan menggunakan semua fitur yang tersedia untuk $accountTypeLabel.")
                ->action('Masuk Sekarang', url('/login'))
                ->line('Terima kasih telah menggunakan TemakCare!');
        } else {
            return (new MailMessage)
                ->subject("Pendaftaran $accountTypeLabel Anda Ditolak")
                ->greeting("Halo {$notifiable->name},")
                ->line("Maaf, pendaftaran $accountTypeLabel Anda pada TemakCare tidak dapat disetujui.")
                ->line("Alasan: " . $this->rejectionReason)
                ->line("Jika Anda memiliki pertanyaan atau memerlukan klarifikasi lebih lanjut, silakan hubungi tim dukungan kami.")
                ->action('Hubungi Dukungan', url('/contact-us'))
                ->line('Terima kasih telah memahami.');
        }
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'status' => $this->status,
            'accountType' => $this->accountType,
            'rejectionReason' => $this->rejectionReason,
        ];
    }
}