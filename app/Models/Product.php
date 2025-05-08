<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'shop_id',
        'name',
        'description',
        'price',
        'stock',
        'image',
        'category',
        'is_active',
        'featured',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Get the shop that owns the product
     */
    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    /**
     * Get product transaction items
     */
    public function transactionItems()
    {
        return $this->hasMany(TransactionItem::class);
    }
}