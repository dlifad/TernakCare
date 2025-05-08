<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'consultation_id',
        'sender_id',
        'message',
        'is_read',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'is_read' => 'boolean',
    ];

    /**
     * Get the consultation that owns the chat
     */
    public function consultation()
    {
        return $this->belongsTo(Consultation::class);
    }

    /**
     * Get the sender user
     */
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}