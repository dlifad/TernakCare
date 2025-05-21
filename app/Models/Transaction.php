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
        'notes',
        'payment_proof',
        'payment_date',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'total_amount' => 'float',
        'farmer_id' => 'integer',
        'shop_id' => 'integer',
    ];

    /**
     * Get the farmer that owns the transaction.
     */
    public function farmer()
    {
        return $this->belongsTo(Farmer::class);
    }

    /**
     * Get the shop for this transaction.
     */
    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    /**
     * Get transaction items.
     */
    public function items()
    {
        return $this->hasMany(TransactionItem::class);
    }

    /**
     * Alias for the items relationship, useful for semantic clarity.
     */
    public function transactionItems()
    {
        return $this->items();
    }

    /**
     * Get the bank account associated with the transaction.
     */
    public function bankAccount()
    {
        return $this->belongsTo(BankAccount::class);
    }


    /**
     * Get the shop name associated with this transaction.
     * This is a convenience accessor using the first transaction item.
     */
    public function getShopNameAttribute()
    {
        $firstItem = $this->items()->with('product.shop')->first();
        return $firstItem ? $firstItem->product->shop->name : null;
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
