import React, { useEffect, useState } from 'react';
import { Head, usePage, Link } from "@inertiajs/react";
import { router } from '@inertiajs/react';
import FarmerLayout from '@/Layouts/FarmerLayout';

export default function PaymentPage(props) {
  const { snapToken, product, quantity, total, orderId, transaction_id, client_key, initial_load } = props;
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    // Memuat script Midtrans snap, tapi hanya jika belum ada
    const loadMidtransScript = () => {
      return new Promise((resolve) => {
        // Periksa apakah script sudah ada untuk mencegah duplikasi
        if (document.querySelector('script[src*="snap.js"]')) {
          console.log('Script Midtrans sudah dimuat sebelumnya');
          setIsScriptLoaded(true);
          resolve();
          return;
        }
        
        console.log('Memuat script Midtrans baru');
        const script = document.createElement('script');
        // Gunakan client_key dari props
        const midtransEnv = process.env.NODE_ENV === 'production' 
          ? 'https://app.midtrans.com/snap/snap.js' 
          : 'https://app.sandbox.midtrans.com/snap/snap.js';
          
        script.src = midtransEnv;
        script.setAttribute('data-client-key', client_key || process.env.MIX_MIDTRANS_CLIENT_KEY);
        script.onload = () => {
          console.log('Script Midtrans berhasil dimuat');
          setIsScriptLoaded(true);
          resolve();
        };
        script.onerror = (error) => {
          console.error('Gagal memuat script Midtrans:', error);
          resolve();
        };
        document.body.appendChild(script);
      });
    };
    
    // Memuat script Midtrans saat komponen dimuat
    if (snapToken) {
      loadMidtransScript();
    }
    
    // Cleanup: Hapus script saat komponen unmount untuk mencegah efek samping
    return () => {
      // Dalam produksi, mungkin tidak perlu menghapus script karena bisa digunakan kembali
      // Tetapi dalam pengembangan, ini bisa membantu menghindari konflik
      if (process.env.NODE_ENV !== 'production') {
        const script = document.querySelector('script[src*="snap.js"]');
        if (script) {
          // console.log('Membersihkan script Midtrans');
          // document.body.removeChild(script);
        }
      }
    };
  }, [snapToken, client_key]);
  
  // Format harga dengan pemisah ribuan
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  
  // Menangani klik tombol Bayar Sekarang
  const handlePayment = () => {
    if (!window.snap) {
      console.error('Objek snap tidak ditemukan');
      alert('Sistem pembayaran belum siap, silakan refresh halaman dan coba lagi');
      return;
    }
    
    if (!snapToken) {
      console.error('Token snap tidak tersedia');
      alert('Token pembayaran tidak tersedia');
      return;
    }
    
    console.log('Memulai pembayaran dengan token:', snapToken);
    setIsProcessing(true);
    
    // Buat objek konfigurasi callback
    const snapCallback = {
      onSuccess: function(result) {
        console.log('Pembayaran sukses:', result);
        window.location.href = `/farmer/payment/success?order_id=${orderId}`;
      },
      onPending: function(result) {
        console.log('Pembayaran pending:', result);
        setIsProcessing(false);
        alert('Pembayaran dalam proses, silakan cek email Anda');
      },
      onError: function(result) {
        console.error('Pembayaran error:', result);
        setIsProcessing(false);
        alert('Pembayaran gagal: ' + (result.status_message || 'Terjadi kesalahan'));
      },
      onClose: function() {
        console.log('Popup pembayaran ditutup');
        setIsProcessing(false);
        alert('Anda menutup popup pembayaran tanpa menyelesaikan transaksi');
      }
    };
    
    // Pastikan snap.pay hanya dipanggil sekali
    try {
      window.snap.pay(snapToken, snapCallback);
    } catch (error) {
      console.error('Error saat memanggil snap.pay:', error);
      setIsProcessing(false);
      alert('Terjadi kesalahan saat memproses pembayaran');
    }
  };
  
  // Menangani tombol Kembali
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
            <span>Marketplace</span> / <span>Checkout</span> / <span>Payment</span>
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
                disabled={isProcessing}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Kembali
              </button>
              
              <button
                onClick={handlePayment}
                disabled={isProcessing || !isScriptLoaded}
                className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </span>
                ) : (
                  "Bayar Sekarang"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </FarmerLayout>
  );
}