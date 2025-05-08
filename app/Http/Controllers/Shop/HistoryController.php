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
     * Display a listing of the completed transactions.
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
        
        // Filter by status if provided
        if ($request->has('status') && in_array($request->status, ['delivered', 'cancelled'])) {
            $query->where('status', $request->status);
        }
        
        // Filter by date range if provided
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('created_at', [$request->start_date, $request->end_date]);
        }
        
        // Search by farmer name if provided
        if ($request->has('search')) {
            $query->whereHas('farmer.user', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            });
        }
        
        $completedTransactions = $query->orderBy('updated_at', 'desc')
            ->paginate(10)
            ->withQueryString();
        
        // Get statistics
        $deliveredCount = Transaction::whereHas('items', function ($q) {
                $q->whereHas('product', function ($p) {
                    $p->where('shop_id', Auth::user()->shop->id);
                });
            })
            ->where('status', 'delivered')
            ->count();
        
        $cancelledCount = Transaction::whereHas('items', function ($q) {
                $q->whereHas('product', function ($p) {
                    $p->where('shop_id', Auth::user()->shop->id);
                });
            })
            ->where('status', 'cancelled')
            ->count();
        
        return Inertia::render('Shop/History/Index', [
            'completedTransactions' => $completedTransactions,
            'filters' => $request->only(['status', 'start_date', 'end_date', 'search']),
            'statistics' => [
                'delivered' => $deliveredCount,
                'cancelled' => $cancelledCount
            ]
        ]);
    }

    /**
     * Display the specified transaction history.
     *
     * @param  \App\Models\Transaction  $transaction
     * @return \Inertia\Response
     */
    public function show(Transaction $transaction)
    {
        // Check if the transaction involves products from the authenticated shop
        $shopProducts = $transaction->items->filter(function ($item) {
            return $item->product->shop_id === Auth::user()->shop->id;
        });
        
        if ($shopProducts->isEmpty()) {
            abort(403, 'Unauthorized action.');
        }
        
        // Check if transaction is completed
        if (!in_array($transaction->status, ['delivered', 'cancelled'])) {
            return redirect()->route('shop.transactions.show', $transaction->id)
                ->with('error', 'This transaction is still active.');
        }
        
        $transaction->load(['farmer.user', 'items.product']);
        
        return Inertia::render('Shop/History/Show', [
            'transaction' => $transaction,
            'shopItems' => $shopProducts
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
        
        // Logic for exporting sales report - this would depend on how you want to handle exports
        // For simplicity, this is a placeholder
        $fileName = 'sales_report_' . now()->format('Y-m-d') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$fileName\"",
        ];
        
        $callback = function() use($completedTransactions) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Transaction ID', 'Farmer', 'Product', 'Quantity', 'Price', 'Total', 'Date']);
            
            foreach ($completedTransactions as $transaction) {
                foreach ($transaction->items as $item) {
                    // Only include products from this shop
                    if ($item->product->shop_id === Auth::user()->shop->id) {
                        fputcsv($file, [
                            $transaction->id,
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