<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountVerifiedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    private $userType;

    /**
     * Create a new notification instance.
     */
    public function __construct($userType)
    {
        $this->userType = $userType;
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
        
        return (new MailMessage)
            ->subject("Akun {$userTypeText} Anda Telah Diverifikasi")
            ->greeting("Selamat {$notifiable->name}!")
            ->line("Akun {$userTypeText} Anda telah diverifikasi oleh Admin dan sekarang aktif.")
            ->line("Anda sekarang dapat login dan mengakses semua fitur TernakCare.")
            ->action('Login Sekarang', url('/login'))
            ->line('Terima kasih telah bergabung dengan TernakCare!');
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