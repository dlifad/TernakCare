<?php

namespace App\Http\Controllers;

use Midtrans\Snap;
use Midtrans\Config;
use Illuminate\Http\Request;
use App\Models\Product;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;


class PaymentController extends Controller
{
    public function getSnapToken(Request $request)
    {
        try {
            // Validasi input
            $request->validate([
                'product_id' => 'required|exists:products,id',
                'quantity' => 'required|integer|min:1',
            ]);

            // Cek konfigurasi
            if (empty(config('midtrans.server_key'))) {
                Log::error('Midtrans server key not configured');
                return back()->withErrors([
                    'snap_error' => 'Konfigurasi pembayaran belum diatur'
                ]);
            }

            // Midtrans configuration
            Config::$serverKey = config('midtrans.server_key');
            Config::$isProduction = config('midtrans.is_production');
            Config::$isSanitized = true;
            Config::$is3ds = true;

            $product = Product::findOrFail($request->product_id);
            $total = $product->price * $request->quantity;
            $orderId = 'ORDER-' . time();

            // Format parameters
            $params = [
                'transaction_details' => [
                    'order_id' => $orderId,
                    'gross_amount' => (int)$total,
                ],
                'customer_details' => [
                    'first_name' => auth()->user()->name,
                    'email' => auth()->user()->email,
                    'phone' => $request->shipping_phone ?? '',
                ],
                'item_details' => [[
                    'id' => $product->id,
                    'price' => (int)$product->price,
                    'quantity' => (int)$request->quantity,
                    'name' => $product->name,
                ]]
            ];

            // Get Snap Token
            $snapToken = Snap::getSnapToken($params);
            
            if (empty($snapToken)) {
                throw new \Exception('Token pembayaran kosong');
            }

            // Langsung render halaman pembayaran
            return Inertia::render('Farmer/Marketplace/PaymentPage', [
                'snapToken' => $snapToken,
                'product' => $product,
                'quantity' => $request->quantity,
                'total' => $total,
                'orderId' => $orderId
            ]);
        } catch (\Exception $e) {
            Log::error('Gagal ambil snap token: ' . $e->getMessage());
            Log::error('Error trace: ' . $e->getTraceAsString());

            return back()->withErrors([
                'snap_error' => 'Gagal mendapatkan token pembayaran: ' . $e->getMessage()
            ]);
        }
    }


}