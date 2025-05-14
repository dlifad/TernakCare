import React, { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import FarmerLayout from "@/Layouts/FarmerLayout";

const PaymentConfirmation = ({ transaction }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    
    // Format harga ke format mata uang rupiah
    const formatPrice = (price) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(price);
    };
    
    const { data, setData, post, processing, errors, reset } = useForm({
        transaction_id: transaction.id,
        payment_proof: null,
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        
        if (file) {
            setData('payment_proof', file);
            
            // Menampilkan preview gambar
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsUploading(true);
        
        post(route("farmer.payment.process"), {
            onSuccess: () => {
                setIsUploading(false);
            },
            onError: () => {
                setIsUploading(false);
            }
        });
    };

    return (
        <FarmerLayout>
            <Head title="Konfirmasi Pembayaran" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <nav className="flex text-sm text-gray-500 mb-6">
                    <Link href={route('farmer.activity')} className="hover:text-primary-dark">
                        Aktivitas
                    </Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-700 font-medium">Konfirmasi Pembayaran</span>
                </nav>

                <h1 className="text-2xl font-bold text-gray-800 mb-6">Konfirmasi Pembayaran</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Informasi Pesanan */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h2 className="text-lg font-medium mb-4">Detail Pesanan</h2>
                            
                            <div className="mb-4 pb-4 border-b border-gray-200">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Kode Transaksi:</span>
                                    <span className="font-medium">{transaction.transaction_code}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Tanggal Pesanan:</span>
                                    <span className="font-medium">
                                        {new Date(transaction.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status:</span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Menunggu Pembayaran
                                    </span>
                                </div>
                            </div>
                            
                            <h3 className="font-medium mb-3">Produk yang Dibeli</h3>
                            <div className="space-y-4 mb-4 pb-4 border-b border-gray-200">
                                {transaction.items.map((item) => (
                                    <div key={item.id} className="flex items-start">
                                        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded overflow-hidden">
                                            {item.product.image ? (
                                                <img 
                                                    src={`/storage/${item.product.image}`}
                                                    alt={item.product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    No image
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <h4 className="text-sm font-medium text-gray-900">{item.product.name}</h4>
                                            <p className="mt-1 text-sm text-gray-500">Jumlah: {item.quantity}</p>
                                            <p className="mt-1 text-sm font-medium text-gray-900">{formatPrice(item.price)} / item</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-medium text-gray-900">{formatPrice(item.subtotal)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mb-4 pb-4 border-b border-gray-200">
                                <h3 className="font-medium mb-3">Informasi Pengiriman</h3>
                                <div className="text-sm text-gray-600">
                                    <p className="mb-2">{transaction.shipping_address}</p>
                                    <p>Telepon: {transaction.shipping_phone}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">{formatPrice(transaction.total_amount)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Biaya Pengiriman</span>
                                    <span className="font-medium">Gratis</span>
                                </div>
                                <div className="pt-2 border-t border-gray-200 flex justify-between">
                                    <span className="text-base font-medium text-gray-900">Total</span>
                                    <span className="text-base font-medium text-primary-dark">{formatPrice(transaction.total_amount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Form Upload Bukti Pembayaran */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                            <h2 className="text-lg font-medium mb-4">Upload Bukti Pembayaran</h2>
                            
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-yellow-700">
                                            Silakan transfer ke rekening berikut dan upload bukti pembayaran.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <p className="font-medium mb-2">Transfer ke rekening:</p>
                                <div className="mb-4">
                                    <p className="font-bold">{transaction.shop?.bank_account?.bank_name || "Bank BCA"}</p>
                                    <p>No. Rekening: {transaction.shop?.bank_account?.account_number || "1234567890"}</p>
                                    <p>Atas Nama: {transaction.shop?.bank_account?.account_holder_name || transaction.shop?.shop_name}</p>
                                </div>
                                <p className="font-medium">Jumlah Transfer: {formatPrice(transaction.total_amount)}</p>
                            </div>
                            
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Bukti Pembayaran*
                                    </label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                        <div className="space-y-1 text-center">
                                            {previewImage ? (
                                                <div>
                                                    <img 
                                                        src={previewImage} 
                                                        alt="Preview bukti pembayaran" 
                                                        className="mx-auto h-48 object-cover mb-2" 
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setPreviewImage(null);
                                                            setData('payment_proof', null);
                                                        }}
                                                        className="text-sm text-red-600 hover:text-red-500"
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H8m36-12h-4m4 0H20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    <div className="flex text-sm text-gray-600">
                                                        <label htmlFor="payment_proof" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-dark hover:text-primary focus-within:outline-none">
                                                            <span>Upload file</span>
                                                            <input 
                                                                id="payment_proof" 
                                                                name="payment_proof" 
                                                                type="file" 
                                                                className="sr-only" 
                                                                accept="image/*"
                                                                onChange={handleFileChange}
                                                                required
                                                            />
                                                        </label>
                                                        <p className="pl-1">atau drag and drop</p>
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        PNG, JPG, GIF sampai 2MB
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {errors.payment_proof && (
                                        <p className="mt-1 text-sm text-red-600">{errors.payment_proof}</p>
                                    )}
                                </div>
                                
                                <div className="flex justify-between mt-8">
                                    <Link
                                        href={route('farmer.activity')}
                                        className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                    >
                                        Kembali
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing || isUploading || !data.payment_proof}
                                        className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-dark hover:bg-primary-darker focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {processing || isUploading ? (
                                            <span className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Mengunggah...
                                            </span>
                                        ) : (
                                            "Kirim Bukti Pembayaran"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </FarmerLayout>
    );
};

export default PaymentConfirmation;