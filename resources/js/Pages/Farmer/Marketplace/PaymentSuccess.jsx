import React from 'react';
import { Head, Link } from "@inertiajs/react";
import FarmerLayout from '@/Layouts/FarmerLayout';

export default function PaymentSuccess(props) {
  const { transaction } = props;
  
  // Format harga dengan pemisah ribuan
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  
  return (
    <FarmerLayout>
      <Head title="Pembayaran Berhasil" />
      
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-4 text-sm">
            <span>Aktivitas</span> / <span>Pembayaran Berhasil</span>
          </div>
          
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 text-center">
            {/* Icon sukses */}
            <div className="mb-6 flex justify-center">
              <div className="bg-green-100 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold mb-4">Pembayaran Berhasil!</h1>
            <p className="text-gray-700 mb-8">Transaksi Anda dengan kode <span className="font-semibold">{transaction.transaction_code}</span> telah berhasil.</p>
            
            {/* Detail Transaksi */}
            <div className="max-w-md mx-auto mb-8 text-left border p-4 rounded">
              <h3 className="font-medium mb-2 border-b pb-2">Detail Transaksi</h3>
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="text-gray-600">Kode Transaksi:</div>
                <div className="font-medium">{transaction.transaction_code}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="text-gray-600">Tanggal:</div>
                <div>{new Date(transaction.created_at).toLocaleDateString('id-ID')}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="text-gray-600">Status:</div>
                <div className="text-green-600 font-medium">Berhasil</div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="text-gray-600">Total Pembayaran:</div>
                <div className="font-bold">Rp {formatPrice(transaction.total_amount)}</div>
              </div>
            </div>
            
            {/* Tombol aksi */}
            <div className="flex flex-col items-center space-y-4">
              <Link
                href={`/farmer/transactions/${transaction.id}`}
                className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 w-full max-w-xs"
              >
                Lihat Detail Transaksi
              </Link>
              
              <Link
                href="/farmer/marketplace"
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 w-full max-w-xs"
              >
                Kembali ke Marketplace
              </Link>
            </div>
          </div>
        </div>
      </div>
    </FarmerLayout>
  );
}