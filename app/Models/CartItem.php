<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'farmer_id',
        'product_id',
        'quantity',
        'status',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'farmer_id' => 'integer',
    ];
    
    public function farmer()
    {
        return $this->belongsTo(Farmer::class);
    }

    /**
     * Relasi ke Cart.
     */
    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    /**
     * Relasi ke Product.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
