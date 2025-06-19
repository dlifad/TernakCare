<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    use HasFactory;

    protected $fillable = [
        'consultation_id',
        'sender_type', // 'doctor' atau 'farmer'
        'sender_id',   // Ini adalah ID dari tabel 'users'
        'message',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function consultation()
    {
        return $this->belongsTo(Consultation::class);
    }

    /**
     * Get the sender of the message (User model).
     */
    public function sender()
    {
        // sender_id adalah foreign key ke tabel users
        return $this->belongsTo(User::class, 'sender_id');
    }
}