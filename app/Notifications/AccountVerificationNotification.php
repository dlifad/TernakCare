<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AccountVerificationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
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
        $role = $notifiable->role;
        $roleText = $role === 'doctor' ? 'Dokter' : 'Toko';
        
        return (new MailMessage)
            ->subject('Pendaftaran Akun ' . $roleText . ' TernakCare')
            ->greeting('Halo, ' . $notifiable->name . '!')
            ->line('Terima kasih telah mendaftar sebagai ' . $roleText . ' di TernakCare.')
            ->line('Sebelum Anda dapat menggunakan akun ' . $roleText . ', kami perlu memverifikasi identitas Anda.')
            ->line('Tim kami sedang memeriksa informasi yang Anda berikan pada saat pendaftaran.')
            ->line('Proses ini biasanya membutuhkan waktu 1-2 hari kerja. Kami akan memberi tahu Anda melalui email ini setelah proses verifikasi selesai.')
            ->line('Terima kasih atas kesabaran Anda.');
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
            //
        ];
    }
}