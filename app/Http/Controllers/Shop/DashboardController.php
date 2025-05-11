<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Di sini Anda bisa menambahkan logika untuk mengambil data 
        // yang diperlukan untuk dashboard toko
        
        return Inertia::render('Shop/Dashboard');
    }
}