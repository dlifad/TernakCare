<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Consultation extends Model
{
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
        'animal_type',
        'issue',
        'description',
        'notes',
        'schedule',
        'location',
        'fee',
        'is_paid',
        'is_completed',
        'farmer_feedback',
        'farmer_rating',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'schedule' => 'datetime',
        'is_paid' => 'boolean',
        'is_completed' => 'boolean',
    ];

    /**
     * Get the farmer that owns the consultation.
     */
    public function farmer(): BelongsTo
    {
        return $this->belongsTo(Farmer::class);
    }

    /**
     * Get the doctor that owns the consultation.
     */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    /**
     * Get the chats for the consultation.
     */
    public function chats(): HasMany
    {
        return $this->hasMany(Chat::class);
    }
}