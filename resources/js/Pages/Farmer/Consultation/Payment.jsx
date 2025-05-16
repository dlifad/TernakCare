import React, { useEffect } from "react";
import { Head, Link, router } from '@inertiajs/react';
import FarmerLayout from '@/Layouts/FarmerLayout';
import { ArrowLeft, CreditCard } from 'lucide-react';

const Payment = ({ consultation, auth }) => {
  useEffect(() => {
    // Load Midtrans script
    const midtransScriptUrl = 'https://app.sandbox.midtrans.com/snap/snap.js';
    const clientKey = consultation.clientKey;

    const script = document.createElement('script');
    script.src = midtransScriptUrl;
    script.setAttribute('data-client-key', clientKey);
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayButtonClick = () => {
    // Memeriksa apakah snap sudah dimuat
    if (window.snap) {
      window.snap.pay(consultation.snapToken, {
        onSuccess: function(result) {
          /* Mengirim data hasil pembayaran ke backend sebelum redirect */
          router.post(route('farmer.consultations.payment.update', consultation.id), {
            status: 'success',
            payment_data: result
          }, {
            onSuccess: () => {
              window.location.href = route('farmer.consultations.payment.finish', consultation.id);
            }
          });
        },
        onPending: function(result) {
          /* Mengirim data hasil pembayaran ke backend sebelum redirect */
          router.post(route('farmer.consultations.payment.update', consultation.id), {
            status: 'pending',
            payment_data: result
          }, {
            onSuccess: () => {
              window.location.href = route('farmer.consultations.payment.finish', consultation.id);
            }
          });
        },
        onError: function(result) {
          /* Mengirim data hasil pembayaran ke backend sebelum redirect */
          router.post(route('farmer.consultations.payment.update', consultation.id), {
            status: 'error',
            payment_data: result
          }, {
            onSuccess: () => {
              window.location.href = route('farmer.consultations.payment.finish', consultation.id);
            }
          });
        },
        onClose: function() {
          /* Anda dapat menambahkan fungsi yang akan dijalankan ketika pop-up ditutup tanpa menyelesaikan pembayaran */
          alert('Anda menutup halaman pembayaran tanpa menyelesaikan transaksi!');
        }
      });
    } else {
      console.error("Snap belum dimuat dengan benar");
      alert("Terjadi kesalahan saat memuat modul pembayaran. Silakan refresh halaman dan coba lagi.");
    }
  };

  return (
    <FarmerLayout>
      <Head title="Pembayaran Konsultasi" />

      <div className="py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Navigation */}
          <div className="mb-6">
            <Link 
              href={route('farmer.consultations.show', consultation.id)}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Kembali ke Detail Konsultasi
            </Link>
          </div>

          {/* Payment Card */}
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Pembayaran Konsultasi</h2>
              
              <div className="mb-6 border-b pb-6">
                <h3 className="text-lg font-medium mb-4">Detail Pembayaran</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dokter</span>
                    <span className="font-medium">{consultation.doctor.name}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Jenis Konsultasi</span>
                    <span className="font-medium">
                      {consultation.type === 'chat' ? 'Chat' : 
                       consultation.type === 'video_call' ? 'Video Call' : 'Kunjungan'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Biaya</span>
                    <span className="font-medium text-lg">Rp {consultation.fee.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Metode Pembayaran</h3>
                <p className="text-gray-600 mb-4">
                  Silakan pilih metode pembayaran yang tersedia melalui Midtrans untuk melanjutkan proses pembayaran.
                </p>
              </div>

              <button
                type="button"
                onClick={handlePayButtonClick}
                className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Bayar Sekarang
              </button>
              
              <div className="mt-4 text-sm text-gray-500 text-center">
                Anda akan diarahkan ke halaman pembayaran Midtrans yang aman
              </div>
            </div>
          </div>
        </div>
      </div>
    </FarmerLayout>
  );
};

export default Payment;