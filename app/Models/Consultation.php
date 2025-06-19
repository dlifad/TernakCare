<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Consultation extends Model
{
    use HasFactory;

    protected $fillable = [
        'farmer_id',
        'doctor_id',
        'type',
        'status',
        'animal_type',
        'issue',
        'schedule',
        'location',
        'description',
        'notes',
        'fee',
        'is_paid',
        'is_completed',
        'midtrans_order_id',
        'midtrans_snap_token',
        'payment_status',
        'payment_details',
    ];

    protected $casts = [
        'doctor_id' => 'integer',
        'id' => 'integer',
        'schedule' => 'datetime',
        'is_paid' => 'boolean',
        'is_completed' => 'boolean',
        'payment_details' => 'array',
    ];


    /**
     * Mendapatkan peternak yang melakukan konsultasi
     */
    public function farmer()
    {
        return $this->belongsTo(Farmer::class);
    }

    /**
     * Mendapatkan dokter yang melakukan konsultasi
     */
    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    /**
     * Mendapatkan chat dalam konsultasi
     */
    public function chats()
    {
        return $this->hasMany(Chat::class);
    }

    // Helper untuk mendapatkan user dari farmer
    public function getFarmerUserAttribute()
    {
        return $this->farmer ? $this->farmer->user : null;
    }

    // Helper untuk mendapatkan user dari doctor
    public function getDoctorUserAttribute()
    {
        return $this->doctor ? $this->doctor->user : null;
    }
}
