import React, { useEffect, useState } from 'react';
import { Head, Link, router } from "@inertiajs/react";
import FarmerLayout from '@/Layouts/FarmerLayout';

// Helper function untuk format harga
const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(price);
};

// Helper function untuk mendapatkan URL gambar
const getImageUrl = (image) => {
    return image ? `/storage/${image}` : '/images/product-placeholder.jpg';
};

// Komponen untuk menampilkan detail item transaksi
const TransactionItems = ({ items }) => (
    <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Item yang dibeli:</h3>
        <div className="space-y-3">
            {items.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded overflow-hidden">
                        <img
                            src={getImageUrl(item.product?.image)}
                            alt={item.product?.name || 'Product'}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                            {item.product?.name || 'Produk tidak ditemukan'}
                        </p>
                        <p className="text-sm text-gray-500">
                            {item.quantity} x {formatPrice(item.price)}
                        </p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                        {formatPrice(item.subtotal)}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// Komponen untuk informasi pengiriman
const ShippingInfo = ({ transaction }) => (
    <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Informasi Pengiriman:</h3>
        <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">Alamat:</span> {transaction.shipping_address}</p>
            <p><span className="font-medium">Telepon:</span> {transaction.shipping_phone}</p>
            {transaction.notes && (
                <p><span className="font-medium">Catatan:</span> {transaction.notes}</p>
            )}
        </div>
    </div>
);

// Komponen utama halaman pembayaran
const PaymentPage = ({ snapToken, transaction, orderId, total, client_key }) => {
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [scriptError, setScriptError] = useState(false);

    useEffect(() => {
        let scriptElement = null;

        const loadMidtransScript = () => {
            return new Promise((resolve, reject) => {
                // Cek apakah script sudah ada
                const existingScript = document.querySelector('script[src*="snap.js"]');
                if (existingScript && window.snap) {
                    console.log('Script Midtrans sudah dimuat sebelumnya');
                    setIsScriptLoaded(true);
                    resolve();
                    return;
                }

                // Hapus script lama jika ada
                if (existingScript) {
                    document.body.removeChild(existingScript);
                }

                console.log('Memuat script Midtrans baru...');
                const script = document.createElement('script');
                
                // Tentukan environment berdasarkan konfigurasi
                const isProduction = process.env.NODE_ENV === 'production';
                const midtransUrl = isProduction 
                    ? 'https://app.midtrans.com/snap/snap.js'
                    : 'https://app.sandbox.midtrans.com/snap/snap.js';
                
                script.src = midtransUrl;
                script.setAttribute('data-client-key', client_key);
                
                script.onload = () => {
                    console.log('Script Midtrans berhasil dimuat');
                    // Tunggu sebentar untuk memastikan window.snap tersedia
                    setTimeout(() => {
                        if (window.snap) {
                            setIsScriptLoaded(true);
                            setScriptError(false);
                            resolve();
                        } else {
                            console.error('window.snap tidak tersedia setelah script dimuat');
                            setScriptError(true);
                            reject(new Error('Snap object not available'));
                        }
                    }, 100);
                };
                
                script.onerror = (error) => {
                    console.error('Gagal memuat script Midtrans:', error);
                    setScriptError(true);
                    reject(error);
                };

                scriptElement = script;
                document.body.appendChild(script);
            });
        };

        // Load script hanya jika ada snapToken
        if (snapToken && client_key) {
            loadMidtransScript().catch(error => {
                console.error('Error loading Midtrans script:', error);
            });
        } else {
            console.error('snapToken atau client_key tidak tersedia:', { snapToken, client_key });
        }

        // Cleanup function
        return () => {
            if (scriptElement && document.body.contains(scriptElement)) {
                try {
                    document.body.removeChild(scriptElement);
                } catch (e) {
                    console.warn('Error removing script:', e);
                }
            }
        };
    }, [snapToken, client_key]);

    // Handler untuk memulai pembayaran
    const handlePayment = () => {
        if (scriptError) {
            alert('Sistem pembayaran tidak dapat dimuat. Silakan refresh halaman dan coba lagi.');
            return;
        }

        if (!window.snap) {
            console.error('Objek snap tidak ditemukan');
            alert('Sistem pembayaran belum siap. Silakan tunggu beberapa saat dan coba lagi.');
            return;
        }

        if (!snapToken) {
            console.error('Token snap tidak tersedia');
            alert('Token pembayaran tidak tersedia');
            return;
        }

        console.log('Memulai pembayaran dengan token:', snapToken);
        setIsProcessing(true);

        const snapCallback = {
            onSuccess: function(result) {
                console.log('Pembayaran sukses:', result);
                setIsProcessing(false);
                // Redirect ke halaman sukses
                router.visit(route('farmer.marketplace.payment.success', { 
                    order_id: orderId 
                }));
            },
            onPending: function(result) {
                console.log('Pembayaran pending:', result);
                setIsProcessing(false);
                alert('Pembayaran sedang diproses. Kami akan menginformasikan status pembayaran Anda melalui email.');
                // Bisa redirect ke halaman status pending jika ada
                router.visit(route('farmer.marketplace'));
            },
            onError: function(result) {
                console.error('Pembayaran error:', result);
                setIsProcessing(false);
                const errorMessage = result.status_message || 'Terjadi kesalahan saat memproses pembayaran';
                alert(`Pembayaran gagal: ${errorMessage}`);
            },
            onClose: function() {
                console.log('Popup pembayaran ditutup');
                setIsProcessing(false);
                // Tidak perlu alert karena user sengaja menutup
            }
        };

        try {
            window.snap.pay(snapToken, snapCallback);
        } catch (error) {
            console.error('Error saat memanggil snap.pay:', error);
            setIsProcessing(false);
            alert('Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.');
        }
    };

    // Handler untuk tombol kembali
    const handleBack = () => {
        router.visit(route('farmer.marketplace.checkout'));
    };

    // Handler untuk retry memuat script
    const handleRetryScript = () => {
        setScriptError(false);
        setIsScriptLoaded(false);
        window.location.reload();
    };

    return (
        <FarmerLayout>
            <Head title="Pembayaran - TernakCare" />
            
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <nav className="flex text-sm text-gray-500 mb-6">
                    <Link
                        href={route('farmer.marketplace.index')}
                        className="hover:text-green-600"
                    >
                        Marketplace
                    </Link>
                    <span className="mx-2">/</span>
                    <Link
                        href={route('farmer.marketplace.checkout')}
                        className="hover:text-green-600"
                    >
                        Checkout
                    </Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-700 font-medium">Pembayaran</span>
                </nav>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Header */}
                    <div className="bg-green-50 px-6 py-4 border-b border-green-100">
                        <h1 className="text-2xl font-bold text-gray-800">Pembayaran Pesanan</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Silakan selesaikan pembayaran untuk melanjutkan pesanan Anda
                        </p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Informasi Transaksi */}
                        <div>
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Detail Transaksi</h2>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Kode Transaksi</p>
                                        <p className="font-medium text-gray-900">{orderId}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Toko</p>
                                        <p className="font-medium text-gray-900">
                                            {transaction?.shop?.shop_name || 'TernakCare'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Status</p>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            Menunggu Pembayaran
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Total Pembayaran</p>
                                        <p className="text-xl font-bold text-green-600">
                                            {formatPrice(total)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Item Transaksi */}
                        {transaction?.items && transaction.items.length > 0 && (
                            <div>
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Item Pesanan</h2>
                                <TransactionItems items={transaction.items} />
                            </div>
                        )}

                        {/* Informasi Pengiriman */}
                        <div>
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Informasi Pengiriman</h2>
                            <ShippingInfo transaction={transaction} />
                        </div>

                        {/* Status Script */}
                        {scriptError && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">
                                            Sistem pembayaran tidak dapat dimuat
                                        </h3>
                                        <div className="mt-2">
                                            <button
                                                onClick={handleRetryScript}
                                                className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
                                            >
                                                Coba Lagi
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tombol Aksi */}
                        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-200">
                            <button
                                onClick={handleBack}
                                disabled={isProcessing}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                Kembali ke Checkout
                            </button>
                            
                            <button
                                onClick={handlePayment}
                                disabled={isProcessing || !isScriptLoaded || scriptError}
                                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {isProcessing ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Memproses Pembayaran...
                                    </span>
                                ) : !isScriptLoaded ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Memuat Sistem Pembayaran...
                                    </span>
                                ) : (
                                    'Bayar Sekarang'
                                )}
                            </button>
                        </div>

                        {/* Loading State Info */}
                        {!isScriptLoaded && !scriptError && (
                            <div className="text-center py-4">
                                <p className="text-sm text-gray-500">
                                    Memuat sistem pembayaran, mohon tunggu...
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </FarmerLayout>
    );
};

export default PaymentPage;