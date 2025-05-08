<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'farmer_id',
        'shop_id',
        'transaction_code',
        'total_amount',
        'status',
        'shipping_address',
        'shipping_phone',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'total_amount' => 'decimal:2',
    ];

    /**
     * Get the farmer that owns the transaction
     */
    public function farmer()
    {
        return $this->belongsTo(Farmer::class);
    }

    /**
     * Get the shop for this transaction
     */
    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    /**
     * Get transaction items
     */
    public function items()
    {
        return $this->hasMany(TransactionItem::class);
    }
}