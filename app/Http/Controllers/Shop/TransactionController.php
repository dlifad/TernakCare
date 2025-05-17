<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransactionController extends Controller
{
    /**
     * Display a listing of the transactions.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        // Inisialisasi query builder
        $query = Transaction::query()
            ->with(['farmer.user', 'items.product'])
            ->where('shop_id', auth::user()->shop->id)
            ->latest();

        // Filter berdasarkan status jika ada
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter berdasarkan pencarian jika ada
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->whereHas('farmer.user', function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%');
            });
        }

        // Filter berdasarkan tanggal jika ada
        if ($request->has('start_date') && $request->start_date) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->has('end_date') && $request->end_date) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // Ambil data dengan pagination
        $transactions = $query->paginate(10)->withQueryString();

        // Status transaksi untuk ditampilkan di tab
        $statuses = [
            'pending' => 'Menunggu Pembayaran',
            'processing' => 'Diproses',
            'shipped' => 'Dikirim',
            'delivered' => 'Selesai',
            'cancelled' => 'Dibatalkan',
        ];

        return Inertia::render('Shop/Transactions/Index', [
            'transactions' => $transactions,
            'filters' => $request->only(['status', 'search', 'start_date', 'end_date']),
            'statuses' => $statuses,
        ]);
    }

    public function show(Transaction $transaction)
    {
        // Validasi bahwa transaksi ini milik toko yang sedang login
        if ($transaction->shop_id !== auth::user()->shop->id) {
            abort(403, 'Anda tidak memiliki akses untuk melihat transaksi ini.');
        }

        // Load relasi yang dibutuhkan
        $transaction->load(['farmer.user', 'items.product']);

        return Inertia::render('Shop/Transactions/Show', [
            'transaction' => $transaction
        ]);
    }

    /**
     * Update the transaction status.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Transaction  $transaction
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateStatus(Request $request, Transaction $transaction)
    {
        // Check if the transaction involves products from the authenticated shop
        $shopProducts = $transaction->items->filter(function ($item) {
            return $item->product->shop_id === Auth::user()->shop->id;
        });
        
        if ($shopProducts->isEmpty()) {
            abort(403, 'Unauthorized action.');
        }
        
        $request->validate([
            'status' => 'required|in:processing,shipped,delivered,cancelled',
            'tracking_number' => 'nullable|string|max:100',
            'shipping_notes' => 'nullable|string|max:255',
        ]);
        
        try {
            return DB::transaction(function() use ($request, $transaction, $shopProducts) {
                $oldStatus = $transaction->status;
                
                // Update transaction status
                $transaction->update([
                    'status' => $request->status,
                    'tracking_number' => $request->tracking_number,
                    'shipping_notes' => $request->shipping_notes,
                ]);
                
                // Pengembalian stok jika status menjadi 'cancelled'
                if ($request->status === 'cancelled' && $oldStatus !== 'cancelled') {
                    foreach ($shopProducts as $item) {
                        $product = Product::find($item->product_id);
                        if ($product) {
                            $product->increment('stock', $item->quantity);
                        }
                    }
                }
                
                return redirect()->back()->with('success', 'Status transaksi berhasil diperbarui');
            });
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal memperbarui status transaksi: ' . $e->getMessage());
        }
    }

    /**
     * Mark transaction items as processed (partially processed transaction).
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Transaction  $transaction
     * @return \Illuminate\Http\RedirectResponse
     */
    public function processItems(Request $request, Transaction $transaction)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*' => 'exists:transaction_items,id',
        ]);
        
        try {
            DB::transaction(function() use ($request, $transaction) {
                foreach ($request->items as $itemId) {
                    $item = TransactionItem::find($itemId);
                    
                    // Check if the item belongs to the transaction and the product belongs to the shop
                    if ($item->transaction_id === $transaction->id && 
                        $item->product && 
                        $item->product->shop_id === Auth::user()->shop->id) {
                        $item->update([
                            'status' => 'processed'
                        ]);
                    }
                }
            });
            
            return back()->with('message', 'Items marked as processed successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to process items: ' . $e->getMessage());
        }
    }

    /**
     * Get list of transaction statuses.
     *
     * @return array
     */
    private function getTransactionStatuses()
    {
        return [
            'pending' => 'Pending',
            'processing' => 'Processing',
            'shipped' => 'Shipped',
            'delivered' => 'Delivered',
            'cancelled' => 'Cancelled',
        ];
    }
}