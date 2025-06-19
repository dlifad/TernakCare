<?php

namespace App\Events;

use App\Models\Chat;
use App\Models\Consultation;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewChatMessage implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Chat $chatMessage;
    public Consultation $consultation;

    /**
     * Create a new event instance.
     */
    public function __construct(Chat $chatMessage, Consultation $consultation)
    {
        $this->chatMessage = $chatMessage;
        $this->consultation = $consultation;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        // Channel privat untuk konsultasi spesifik
        // Hanya user yang terlibat dalam konsultasi ini yang bisa mendengarkan
        return [
            new PrivateChannel('consultation.' . $this->consultation->id),
        ];
    }

    /**
     * The event's broadcast name.
     * Ini adalah nama event yang akan didengarkan di frontend.
     */
    public function broadcastAs(): string
    {
        return 'new.chat.message';
    }

    /**
     * Get the data to broadcast.
     * Data yang dikirim ke frontend.
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->chatMessage->id,
            'consultation_id' => $this->chatMessage->consultation_id,
            'sender_id' => $this->chatMessage->sender_id, // ID dari User pengirim
            'sender_type' => $this->chatMessage->sender_type, // 'doctor' atau 'farmer'
            'message' => $this->chatMessage->message,
            'created_at' => $this->chatMessage->created_at->toIso8601String(), // Format standar untuk JS
            'created_at_formatted' => $this->chatMessage->created_at->format('d M Y H:i'), // Format tampilan
            // Anda bisa menambahkan data sender (nama, foto) jika diperlukan,
            // tapi pastikan untuk tidak mengirim data sensitif yang tidak perlu.
            // 'sender' => [
            //     'name' => $this->chatMessage->sender->name, // Asumsi ada relasi sender() di model Chat ke User
            // ]
        ];
    }
}