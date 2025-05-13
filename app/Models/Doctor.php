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
        'practice_address',
        'phone_number',
        'years_experience',
        'status',
        'rejection_reason',
        'profile_photo',
        'about',
        'consultation_fee',
        'is_available_online',
        'working_hours',
        'chat_service_active',
        'chat_service_fee',
        'video_call_service_active',
        'video_call_service_fee',
        'home_visit_service_active',
        'home_visit_service_fee',
    ];

    protected $casts = [
        'chat_service_active' => 'boolean',
        'video_call_service_active' => 'boolean',
        'home_visit_service_active' => 'boolean',
        'chat_service_fee' => 'integer',
        'video_call_service_fee' => 'integer',
        'home_visit_service_fee' => 'integer',
    ];

    /**
     * Get the user that owns the doctor profile.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function toProfileData()
    {
        return [
            'id' => $this->id,
            'name' => $this->user->name,
            'email' => $this->user->email,
            'phone' => $this->user->phone,
            'address' => $this->user->address,
            'license_number' => $this->license_number,
            'years_experience' => $this->years_experience,
            'working_hours' => $this->working_hours,
            'practice_address' => $this->practice_address,
            'about' => $this->about,
            'chat_service_active' => $this->chat_service_active,
            'chat_service_fee' => $this->chat_service_fee,
            'video_call_service_active' => $this->video_call_service_active,
            'video_call_service_fee' => $this->video_call_service_fee,
            'home_visit_service_active' => $this->home_visit_service_active,
            'home_visit_service_fee' => $this->home_visit_service_fee,
        ];
    }
}
