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
        'status',
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
     * Set default values based on role before creating user.
     */
    protected static function booted()
    {
        static::creating(function ($user) {
            // Set default status for farmer
            if ($user->role === 'farmer' && empty($user->status)) {
                $user->status = 'verified';
            }
        });

        // Dihapus: auto-create doctor agar license_number bisa disiapkan saat pembuatan manual
        // static::created(function ($user) {
        //     if ($user->role === 'doctor') {
        //         \App\Models\Doctor::create([
        //             'user_id' => $user->id,
        //         ]);
        //     }
        // });
    }

    // Relationships
    public function doctor()
    {
        return $this->hasOne(Doctor::class);
    }

    public function shop()
    {
        return $this->hasOne(Shop::class);
    }

    // Role checkers
    public function isFarmer()
    {
        return $this->role === 'farmer';
    }

    public function isDoctor()
    {
        return $this->role === 'doctor';
    }

    public function isShop()
    {
        return $this->role === 'shop';
    }
}
