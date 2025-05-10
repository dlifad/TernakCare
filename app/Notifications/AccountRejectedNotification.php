<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $userType;
    protected $rejectionReason;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct($userType, $rejectionReason)
    {
        $this->userType = $userType;
        $this->rejectionReason = $rejectionReason;
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
        $contactUrl = url('/contact');

        return (new MailMessage)
            ->subject("Pendaftaran Akun $type Anda Ditolak")
            ->greeting("Dear {$notifiable->name},")
            ->line("Maaf, pendaftaran akun $type Anda di TernakCare telah ditolak.")
            ->line("Alasan penolakan: {$this->rejectionReason}")
            ->line("Jika Anda memiliki pertanyaan, silakan hubungi tim dukungan kami.")
            ->action('Hubungi Kami', $contactUrl)
            ->line('Terima kasih atas minat Anda menggunakan TernakCare.');
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
            'message' => 'Pendaftaran akun Anda ditolak.',
            'type' => $this->userType,
            'reason' => $this->rejectionReason,
        ];
    }
}