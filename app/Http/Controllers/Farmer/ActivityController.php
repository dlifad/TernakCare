<?php

namespace App\Http\Controllers\Farmer;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ActivityController extends Controller
{
    /**
     * Display the farmer's consultation history.
     */
    public function consultationHistory()
    {
        $consultations = Consultation::where('farmer_id', Auth::user()->farmer->id)
            ->with('doctor.user')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Farmer/Activity/ConsultationHistory', [
            'consultations' => $consultations,
        ]);
    }

    /**
     * Display the farmer's order history.
     */
    public function orderHistory()
    {
        $orders = Transaction::where('farmer_id', Auth::user()->farmer->id)
            ->with(['shop.user', 'transactionItems.product'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Farmer/Activity/OrderHistory', [
            'orders' => $orders,
        ]);
    }

    /**
     * Display a specific order.
     */
    public function showOrder($id)
    {
        $order = Transaction::where('farmer_id', Auth::user()->farmer->id)
            ->with(['shop.user', 'transactionItems.product'])
            ->findOrFail($id);

        return Inertia::render('Farmer/Activity/OrderDetail', [
            'order' => $order,
        ]);
    }

    /**
     * Cancel an order.
     */
    public function cancelOrder($id)
    {
        $order = Transaction::where('farmer_id', Auth::user()->farmer->id)
            ->where('status', 'pending')
            ->findOrFail($id);

        $order->status = 'cancelled';
        $order->save();

        return redirect()->back()->with('message', 'Order cancelled successfully.');
    }

    /**
     * Confirm order delivery.
     */
    public function confirmDelivery($id)
    {
        $order = Transaction::where('farmer_id', Auth::user()->farmer->id)
            ->where('status', 'shipped')
            ->findOrFail($id);

        $order->status = 'delivered';
        $order->save();

        return redirect()->back()->with('message', 'Order delivery confirmed successfully.');
    }

    /**
     * Submit a review for an order.
     */
    public function reviewOrder(Request $request, $id)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string|max:500',
        ]);

        $order = Transaction::where('farmer_id', Auth::user()->farmer->id)
            ->where('status', 'delivered')
            ->findOrFail($id);

        $order->rating = $request->rating;
        $order->review = $request->review;
        $order->save();

        return redirect()->back()->with('message', 'Review submitted successfully.');
    }

    public function index()
    {
        $farmerId = Auth::user()->farmer->id;

        // Get recent consultations
        $recentConsultations = Consultation::where('farmer_id', $farmerId)
            ->with('doctor.user')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Get recent orders
        $recentOrders = Transaction::where('farmer_id', $farmerId)
            ->with(['shop.user', 'transactionItems.product'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Get consultation stats
        $consultationStats = [
            'total' => Consultation::where('farmer_id', $farmerId)->count(),
            'active' => Consultation::where('farmer_id', $farmerId)->where('status', 'active')->count(),
            'pending' => Consultation::where('farmer_id', $farmerId)->where('status', 'pending')->count(),
            'completed' => Consultation::where('farmer_id', $farmerId)->where('status', 'completed')->count(),
        ];

        // Get order stats
        $orderStats = [
            'total' => Transaction::where('farmer_id', $farmerId)->count(),
            'pending' => Transaction::where('farmer_id', $farmerId)->where('status', 'pending')->count(),
            'processing' => Transaction::where('farmer_id', $farmerId)->where('status', 'processing')->count(),
            'shipped' => Transaction::where('farmer_id', $farmerId)->where('status', 'shipped')->count(),
            'delivered' => Transaction::where('farmer_id', $farmerId)->where('status', 'delivered')->count(),
            'cancelled' => Transaction::where('farmer_id', $farmerId)->where('status', 'cancelled')->count(),
        ];

        return Inertia::render('Farmer/Activity/Index', [
            'recentConsultations' => $recentConsultations,
            'recentOrders' => $recentOrders,
            'consultationStats' => $consultationStats,
            'orderStats' => $orderStats,
        ]);
    } 
}