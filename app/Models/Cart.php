<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory;

    protected $fillable = [
        'farmer_id',
        'product_id',
        'quantity',
    ];

    /**
     * Get the farmer that owns the cart item.
     */
    public function farmer()
    {
        return $this->belongsTo(Farmer::class);
    }

    /**
     * Get the product in the cart.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function items()
    {
        return $this->hasMany(CartItem::class);
    }

}