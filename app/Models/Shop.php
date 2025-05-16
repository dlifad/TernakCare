<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Shop extends Model
{
    use HasFactory;

    protected $fillable = [
        'shop_name',
        'shop_phone',
        'shop_address',
        'shop_description',
        'owner_id_number',
        'status',
        'rejection_reason',
        'shop_logo',
        'shop_banner',
        'delivery_options',
        'payment_methods',
        'operating_hours'
    ];

    // Jika delivery_options, payment_methods, dan operating_hours disimpan sebagai JSON
    protected $casts = [
        'delivery_options' => 'array',
        'payment_methods' => 'array',
        'operating_hours' => 'array'
    ];

    // Relasi ke User
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    
    // Relasi ke Product
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    // Relasi ke Transaction
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    // Relasi ke BankAccount
    public function bankAccount()
    {
        return $this->hasOne(BankAccount::class);
    }

    
}