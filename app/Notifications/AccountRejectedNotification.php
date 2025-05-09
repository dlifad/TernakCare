<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    private $userType;
    private $reason;

    /**
     * Create a new notification instance.
     */
    public function __construct($userType, $reason = null)
    {
        $this->userType = $userType;
        $this->reason = $reason;
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
        $userTypeText = $this->userType === 'doctor' ? 'Dokter' : 'Toko';
        
        $message = (new MailMessage)
            ->subject("Informasi Pendaftaran Akun {$userTypeText}")
            ->greeting("Halo {$notifiable->name},")
            ->line("Kami ingin memberitahu bahwa pendaftaran akun {$userTypeText} Anda pada TernakCare tidak disetujui.");
            
        if ($this->reason) {
            $message->line("Alasan: {$this->reason}");
        }
            
        return $message
            ->line("Jika Anda memiliki pertanyaan atau ingin mendaftar ulang, silakan hubungi kami melalui email support@ternakcare.com")
            ->line("Terima kasih atas minat Anda pada TernakCare.");
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}