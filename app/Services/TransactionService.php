<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\User;
use App\Models\Farmer; // Tambahkan import model Farmer
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TransactionService
{
    /**
     * Mendapatkan ringkasan transaksi untuk dashboard toko
     * 
     * @param int $shopId
     * @return array
     */
    public function getTransactionSummary(int $shopId)
    {
        // Kode untuk total products, active products dll seperti sebelumnya
        $totalProducts = Product::where('shop_id', $shopId)->count();
        $activeProducts = Product::where('shop_id', $shopId)
            ->where('is_active', true)
            ->count();
        $pendingTransactions = Transaction::where('shop_id', $shopId)
            ->whereIn('status', ['pending', 'processing', 'shipped']) // Tambah 'shipped'
            ->count();

        $completedTransactions = Transaction::where('shop_id', $shopId)
            ->where('status', 'delivered') // Hanya 'delivered'
            ->count();
        
        // PERBAIKAN: Query untuk transaksi terbaru dengan JOIN yang benar melalui tabel farmers
        $recentTransactions = Transaction::where('transactions.shop_id', $shopId)
            ->leftJoin('farmers', 'transactions.farmer_id', '=', 'farmers.id')
            ->leftJoin('users', 'farmers.user_id', '=', 'users.id')
            ->leftJoin('transaction_items', 'transactions.id', '=', 'transaction_items.transaction_id')
            ->leftJoin('products', 'transaction_items.product_id', '=', 'products.id')
            ->select(
                'transactions.id',
                'transactions.farmer_id',
                'users.name as farmer_name',
                DB::raw('COUNT(DISTINCT transaction_items.id) as product_count'),
                DB::raw('MIN(products.name) as main_product'),
                'transactions.total_amount as total',
                'transactions.status',
                'transactions.created_at'
            )
            ->groupBy('transactions.id', 'transactions.farmer_id', 'users.name', 'transactions.total_amount', 'transactions.status', 'transactions.created_at')
            ->orderBy('transactions.created_at', 'desc')
            ->limit(5)
            ->get();
            
        // PERBAIKAN: Tambahkan fallback untuk nama peternak yang hilang dengan pendekatan yang lebih baik
        foreach ($recentTransactions as $transaction) {
            // Jika nama peternak kosong, coba ambil melalui relasi yang benar
            if (empty($transaction->farmer_name)) {
                try {
                    // Ambil data farmer
                    $farmer = DB::table('farmers')
                        ->where('id', $transaction->farmer_id)
                        ->first();
                    
                    if ($farmer && $farmer->user_id) {
                        // Ambil data user terkait
                        $user = User::find($farmer->user_id);
                        if ($user) {
                            $transaction->farmer_name = $user->name;
                            Log::info("Fixed missing farmer name for transaction #{$transaction->id}: {$transaction->farmer_name}");
                        }
                    }
                    
                    // Jika masih tidak ada nama, gunakan ID sebagai fallback
                    if (empty($transaction->farmer_name)) {
                        $transaction->farmer_name = 'Peternak #' . $transaction->farmer_id;
                        Log::warning("Could not find name for farmer #{$transaction->farmer_id}, using fallback");
                    }
                } catch (\Exception $e) {
                    // Tangani error dengan graceful fallback
                    $transaction->farmer_name = 'Peternak #' . $transaction->farmer_id;
                    Log::error("Error retrieving farmer name: " . $e->getMessage());
                }
            }
        }

        // Kode untuk top products dan monthly revenue sama seperti sebelumnya
        $topProducts = Product::where('products.shop_id', $shopId)
            ->leftJoin('transaction_items', 'products.id', '=', 'transaction_items.product_id')
            ->select(
                'products.id',
                'products.name',
                'products.price',
                DB::raw('SUM(COALESCE(transaction_items.quantity, 0)) as sold')
            )
            ->groupBy('products.id', 'products.name', 'products.price')
            ->orderBy('sold', 'desc')
            ->limit(5)
            ->get();
        
        // PERBAIKAN: Logika untuk mendapatkan pendapatan bulanan lebih jelas
        $monthlyRevenue = [];
        
        // Mulai dari 5 bulan yang lalu sampai bulan saat ini (6 bulan total)
        $startDate = Carbon::now()->subMonths(5)->startOfMonth();
        $endDate = Carbon::now()->endOfMonth();
        
        // Buat array bulan-bulan yang akan ditampilkan
        $months = [];
        $currentDate = $startDate->copy();
        
        // Buat array bulan-bulan dari startDate sampai endDate
        while ($currentDate->lte($endDate)) {
            $months[] = [
                'start' => $currentDate->copy()->startOfMonth(),
                'end' => $currentDate->copy()->endOfMonth(),
                'label' => $currentDate->format('M'), // Format bulan singkat (Dec, Jan, Feb, dst)
            ];
            $currentDate->addMonth();
        }
        
        // Log untuk membantu debugging
        Log::info("Generating monthly revenue for " . count($months) . " months");
        
        // Iterasi melalui setiap bulan untuk mendapatkan pendapatan
        foreach ($months as $month) {
            $revenue = Transaction::where('shop_id', $shopId)
                ->whereIn('status', ['shipped', 'delivered'])
                ->whereBetween('created_at', [
                    $month['start']->format('Y-m-d H:i:s'),
                    $month['end']->format('Y-m-d H:i:s')
                ])
                ->sum('total_amount');
            
            // Log untuk membantu debugging
            Log::info("Revenue for {$month['label']}: {$revenue}");
            
            $monthlyRevenue[] = [
                'month' => $month['label'],
                'amount' => (float) $revenue
            ];
        }
        
        // Log semua revenue untuk debugging
        Log::info("Monthly revenue data: " . json_encode($monthlyRevenue));
        
        return [
            'totalProducts' => $totalProducts,
            'activeProducts' => $activeProducts,
            'pendingTransactions' => $pendingTransactions,
            'completedTransactions' => $completedTransactions,
            'recentTransactions' => $recentTransactions,
            'topProducts' => $topProducts,
            'monthlyRevenue' => $monthlyRevenue
        ];
    }
}