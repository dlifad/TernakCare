<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountVerifiedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $userType;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct($userType)
    {
        $this->userType = $userType;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $type = $this->userType === 'doctor' ? 'Dokter' : 'Toko';
        $loginUrl = url('/login');

        return (new MailMessage)
            ->subject("Akun $type Anda Telah Diverifikasi")
            ->greeting("Selamat, {$notifiable->name}!")
            ->line("Akun $type Anda di TernakCare telah diverifikasi oleh admin.")
            ->line("Anda sekarang dapat masuk ke platform dan mulai menggunakan fitur-fitur yang tersedia.")
            ->action('Masuk Sekarang', $loginUrl)
            ->line('Terima kasih telah bergabung dengan TernakCare!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        return [
            'message' => 'Akun Anda telah diverifikasi.',
            'type' => $this->userType,
        ];
    }
}