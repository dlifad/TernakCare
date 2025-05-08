<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Get the doctor profile associated with the user.
     */
    public function doctor()
    {
        return $this->hasOne(Doctor::class);
    }

    /**
     * Get the shop profile associated with the user.
     */
    public function shop()
    {
        return $this->hasOne(Shop::class);
    }

    /**
     * Check if user is a farmer.
     */
    public function isFarmer()
    {
        return $this->role === 'farmer';
    }

    /**
     * Check if user is a doctor.
     */
    public function isDoctor()
    {
        return $this->role === 'doctor';
    }

    /**
     * Check if user is a shop.
     */
    public function isShop()
    {
        return $this->role === 'shop';
    }
}