<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Farmer extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id',
        'address',
        'phone',
        'profile_photo',
        'bio',
    ];

    /**
     * Get the user that owns the farmer profile
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get farmer consultations
     */
    public function consultations()
    {
        return $this->hasMany(Consultation::class);
    }

    /**
     * Get farmer transactions
     */
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}