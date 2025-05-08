<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Doctor extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'license_number',
        'specialization',
        'practice_address',
        'phone_number',
        'education',
        'years_experience',
        'status',
        'profile_photo',
        'about',
        'consultation_fee',
        'is_available_online',
        'working_hours',
    ];

    /**
     * Get the user that owns the doctor profile.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if doctor is verified.
     */
    public function isVerified()
    {
        return $this->status === 'verified';
    }

    /**
     * Check if doctor is pending verification.
     */
    public function isPending()
    {
        return $this->status === 'pending';
    }

    /**
     * Check if doctor is rejected.
     */
    public function isRejected()
    {
        return $this->status === 'rejected';
    }
}