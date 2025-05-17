<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HistoryController extends Controller
{
    /**
     * Display a listing of completed transactions.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $query = Transaction::whereHas('items', function ($q) {
                $q->whereHas('product', function ($p) {
                    $p->where('shop_id', Auth::user()->shop->id);
                });
            })
            ->whereIn('status', ['delivered', 'cancelled'])
            ->with(['farmer.user', 'items.product']);
        
        // Filter by status hanya jika status tidak kosong
        if ($request->filled('status') && in_array($request->status, ['delivered', 'cancelled'])) {
            $query->where('status', $request->status);
        }
        
        // Filter by date range hanya jika kedua tanggal diisi
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('created_at', [$request->start_date, $request->end_date]);
        }
        
        // Search by farmer name hanya jika search tidak kosong
        if ($request->filled('search')) {
            $query->whereHas('farmer.user', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            });
        }
        
        $completedTransactions = $query->orderBy('updated_at', 'desc')
            ->paginate(10)
            ->withQueryString();
        
        // Calculate metrics
        $deliveredTransactions = Transaction::whereHas('items', function ($q) {
                $q->whereHas('product', function ($p) {
                    $p->where('shop_id', Auth::user()->shop->id);
                });
            })
            ->where('status', 'delivered')
            ->get();
        
        $totalSales = $deliveredTransactions->sum('total_amount');
        $totalTransactions = $deliveredTransactions->count();
        $averageOrder = $totalTransactions > 0 ? $totalSales / $totalTransactions : 0;
        
        $cancelledCount = Transaction::whereHas('items', function ($q) {
                $q->whereHas('product', function ($p) {
                    $p->where('shop_id', Auth::user()->shop->id);
                });
            })
            ->where('status', 'cancelled')
            ->count();
        
        return Inertia::render('Shop/History/Index', [
            'transactions' => $completedTransactions,
            'filters' => $request->only(['status', 'start_date', 'end_date', 'search']),
            'statistics' => [
                'totalSales' => $totalSales,
                'totalTransactions' => $totalTransactions,
                'averageOrder' => $averageOrder,
                'cancelledOrders' => $cancelledCount
            ]
        ]);
    }

    public function show($id)
    {
        $transaction = Transaction::with([
            'farmer.user',
            'items.product',
            'address',
            'payment'
        ])->findOrFail($id);
        
        // Verifikasi bahwa transaksi ini memiliki setidaknya satu produk dari toko pengguna ini
        $hasShopProducts = $transaction->items->contains(function ($item) {
            return $item->product->shop_id === Auth::user()->shop->id;
        });
        
        if (!$hasShopProducts) {
            abort(403, 'Anda tidak memiliki akses ke transaksi ini');
        }
        
        // Filter item transaksi untuk hanya menampilkan produk dari toko ini
        $transaction->items = $transaction->items->filter(function ($item) {
            return $item->product->shop_id === Auth::user()->shop->id;
        });
        
        // Hitung subtotal untuk produk dari toko ini saja
        $subtotal = $transaction->items->sum(function ($item) {
            return $item->quantity * $item->price;
        });
        
        return Inertia::render('Shop/History/Show', [
            'transaction' => $transaction,
            'subtotal' => $subtotal
        ]);
    }

    /**
     * Generate sales report.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public function exportReport(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);
        
        $completedTransactions = Transaction::whereHas('items', function ($q) {
                $q->whereHas('product', function ($p) {
                    $p->where('shop_id', Auth::user()->shop->id);
                });
            })
            ->where('status', 'delivered')
            ->whereBetween('updated_at', [$request->start_date, $request->end_date])
            ->with(['farmer.user', 'items.product'])
            ->get();
        
        $fileName = 'sales_report_' . now()->format('Y-m-d') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$fileName\"",
        ];
        
        $callback = function() use($completedTransactions) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID Transaksi', 'Pelanggan', 'Produk', 'Jumlah', 'Harga', 'Total', 'Tanggal']);
            
            foreach ($completedTransactions as $transaction) {
                foreach ($transaction->items as $item) {
                    // Only include products from this shop
                    if ($item->product->shop_id === Auth::user()->shop->id) {
                        fputcsv($file, [
                            $transaction->transaction_code,
                            $transaction->farmer->user->name,
                            $item->product->name,
                            $item->quantity,
                            $item->price,
                            $item->quantity * $item->price,
                            $transaction->updated_at->format('Y-m-d H:i'),
                        ]);
                    }
                }
            }
            
            fclose($file);
        };
        
        return response()->stream($callback, 200, $headers);
    }
}