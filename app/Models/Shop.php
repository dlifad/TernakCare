<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Shop extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'shop_name',
        'shop_phone',
        'shop_address',
        'shop_description',
        'business_license',
        'shop_type',
        'owner_id_number',
        'status',
        'shop_logo',
        'shop_banner',
        'delivery_options',
        'payment_methods',
        'operating_hours',
    ];

    /**
     * Get the user that owns the shop.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get products associated with this shop.
     */
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Check if shop is verified.
     */
    public function isVerified()
    {
        return $this->status === 'verified';
    }

    /**
     * Check if shop is pending verification.
     */
    public function isPending()
    {
        return $this->status === 'pending';
    }

    /**
     * Check if shop is rejected.
     */
    public function isRejected()
    {
        return $this->status === 'rejected';
    }
}