<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
        $query = Transaction::whereHas('items', function ($q) {
                $q->whereHas('product', function ($p) {
                    $p->where('shop_id', Auth::user()->shop->id);
                });
            })
            ->with(['farmer.user', 'items.product']);
        
        // Filter by status if provided
        if ($request->has('status') && $request->status !== 'all') {
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
        
        $transactions = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();
        
        return Inertia::render('Shop/Transactions/Index', [
            'transactions' => $transactions,
            'filters' => $request->only(['status', 'start_date', 'end_date', 'search']),
            'statuses' => $this->getTransactionStatuses()
        ]);
    }

    /**
     * Display the specified transaction.
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
        
        $transaction->load(['farmer.user', 'items.product']);
        
        return Inertia::render('Shop/Transactions/Show', [
            'transaction' => $transaction,
            'shopItems' => $shopProducts
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
        
        // Update transaction status
        $transaction->update([
            'status' => $request->status,
            'tracking_number' => $request->tracking_number,
            'shipping_notes' => $request->shipping_notes,
        ]);
        
        return redirect()->route('shop.transactions.index')
            ->with('message', 'Transaction status updated successfully');
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
        
        foreach ($request->items as $itemId) {
            $item = TransactionItem::find($itemId);
            
            // Check if the item belongs to the transaction and the product belongs to the shop
            if ($item->transaction_id === $transaction->id && $item->product->shop_id === Auth::user()->shop->id) {
                $item->update([
                    'status' => 'processed'
                ]);
            }
        }
        
        return back()->with('message', 'Items marked as processed successfully');
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