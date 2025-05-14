// File: resources/js/Pages/Farmer/Marketplace/PaymentPage.jsx
import React, { useEffect } from 'react';
import { Head, usePage, Link } from "@inertiajs/react";
import FarmerLayout from '@/Layouts/FarmerLayout'; 
export default function PaymentPage(props) {
  const { snapToken, product, quantity, total, orderId } = props;
  
  useEffect(() => {
    // Load Midtrans snap script
    const loadMidtransScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', process.env.MIX_MIDTRANS_CLIENT_KEY);
        script.onload = () => resolve();
        document.body.appendChild(script);
      });
    };
    
    // Jika snapToken tersedia, load script Midtrans
    if (snapToken) {
      loadMidtransScript();
    }
  }, [snapToken]);
  
  // Format harga dengan pemisah ribuan
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  
  // Handle tombol Bayar Sekarang
  const handlePayment = () => {
    if (window.snap && snapToken) {
      window.snap.pay(snapToken, {
        onSuccess: function(result) {
          // Handle sukses, misalnya redirect ke halaman sukses
          window.location.href = '/payment/success?order_id=' + orderId;
        },
        onPending: function(result) {
          // Handle pending
          alert('Pembayaran dalam proses, silakan cek email Anda');
        },
        onError: function(result) {
          // Handle error
          alert('Pembayaran gagal: ' + result.status_message);
        },
        onClose: function() {
          // Handle ketika popup ditutup
          alert('Anda menutup popup pembayaran tanpa menyelesaikan transaksi');
        }
      });
    } else {
      alert('Sistem pembayaran belum siap, silakan coba beberapa saat lagi');
    }
  };
  
  // Handle tombol Kembali
  const handleBack = () => {
    window.history.back();
  };
  
  return (
    <FarmerLayout>
      <Head title="Pembayaran Pesanan" />
      
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-4 text-sm">
            <span>Aktivitas</span> / <span>Pembayaran</span>
          </div>
          
          <h1 className="text-2xl font-bold mb-6">Pembayaran Pesanan</h1>
          
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            {/* Detail Transaksi */}
            <div className="mb-4">
              <div className="font-medium text-gray-700">Kode Transaksi</div>
              <div className="text-gray-900">{orderId}</div>
            </div>
            
            <div className="mb-4">
              <div className="font-medium text-gray-700">Item</div>
              <div className="text-gray-900">{product.name} (x{quantity})</div>
            </div>
            
            <div className="mb-6">
              <div className="font-medium text-gray-700">Total Pembayaran</div>
              <div className="text-xl font-bold text-orange-500">Rp {formatPrice(total)}</div>
            </div>
            
            {/* Tombol Aksi */}
            <div className="flex justify-between pt-4">
              <button
                onClick={handleBack}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Kembali
              </button>
              
              <button
                onClick={handlePayment}
                className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Bayar Sekarang
              </button>
            </div>
          </div>
          
          {/* Debug Info - hanya tampil di development */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h3 className="text-sm font-bold">Debug Info:</h3>
              <p className="text-xs">Snap Token tersedia: {snapToken ? 'Ya' : 'Tidak'}</p>
            </div>
          )}
        </div>
      </div>
    </FarmerLayout>
  );
}