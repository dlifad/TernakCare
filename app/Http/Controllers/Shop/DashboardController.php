<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Services\TransactionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    protected $transactionService;
    
    public function __construct(TransactionService $transactionService)
    {
        $this->transactionService = $transactionService;
    }
    
    /**
     * Menampilkan dashboard toko
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $shopId = auth()->user()->shop->id;
        
        return Inertia::render('Shop/Dashboard', [
            'dashboardData' => $this->transactionService->getTransactionSummary($shopId),
        ]);
    }
}