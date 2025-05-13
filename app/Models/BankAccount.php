<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BankAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'shop_id',
        'bank_name',
        'account_number',
        'account_name'
    ];

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }
}