<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Consultation extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'farmer_id',
        'doctor_id',
        'type',
        'status',
        'schedule',
        'description',
        'notes',
        'fee',
        'is_paid',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'schedule' => 'datetime',
        'fee' => 'decimal:2',
        'is_paid' => 'boolean',
    ];

    /**
     * Get the farmer that owns the consultation
     */
    public function farmer()
    {
        return $this->belongsTo(Farmer::class);
    }

    /**
     * Get the doctor for this consultation
     */
    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    /**
     * Get consultation chats
     */
    public function chats()
    {
        return $this->hasMany(Chat::class);
    }
}