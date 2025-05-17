import React from "react";
import {
    ArrowLeft,
    Package,
    Truck,
    Receipt,
    Calendar,
    User,
    Phone,
} from "lucide-react";
import ShopLayout from "@/Layouts/ShopLayout";
import { Head, Link } from "@inertiajs/react";
import { format } from '@/Components/Common/format';

export default function HistoryShow({ auth, transaction, subtotal }) {
    // Format currency to IDR
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Get status badge class based on the status
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case "delivered":
                return "bg-success/20 text-success";
            case "cancelled":
                return "bg-danger/20 text-danger";
            default:
                return "bg-neutral-light text-neutral-dark";
        }
    };

    // Get status text based on the status
    const getStatusText = (status) => {
        switch (status) {
            case "delivered":
                return "Selesai";
            case "cancelled":
                return "Dibatalkan";
            default:
                return status;
        }
    };

    return (
        <ShopLayout user={auth.user}>
            <Head title={`Detail Transaksi ${transaction.transaction_code}`} />
            <div className="py-6 px-4 sm:px-6 lg:px-8">
                {/* Back Button and Header */}
                <div className="mb-6">
                    <Link 
                        href={route('shop.history')} 
                        className="flex items-center text-primary hover:text-primary-dark mb-4"
                    >
                        <ArrowLeft size={16} className="mr-1" />
                        <span>Kembali ke Riwayat</span>
                    </Link>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold font-heading text-neutral-darkest">
                                Detail Transaksi
                            </h1>
                            <p className="text-neutral-dark">
                                ID Transaksi: {transaction.transaction_code}
                            </p>
                        </div>
                        <div className="mt-2 sm:mt-0">
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(transaction.status)}`}
                            >
                                {getStatusText(transaction.status)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Transaction Details */}
                    <div className="lg:col-span-2">
                        {/* Order Items */}
                        <div className="bg-white rounded-lg shadow-card mb-6">
                            <div className="p-4 border-b border-neutral-light">
                                <h2 className="text-lg font-semibold text-neutral-darkest flex items-center">
                                    <Package size={18} className="mr-2 text-primary" />
                                    Produk Yang Dibeli
                                </h2>
                            </div>
                            <div className="p-4">
                                <div className="divide-y divide-neutral-light">
                                    {transaction.items.map((item) => (
                                        <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                                            <div className="flex items-start">
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-neutral-darkest">
                                                        {item.product.name}
                                                    </h3>
                                                    <p className="text-sm text-neutral-dark mt-1">
                                                        {item.quantity} x {formatCurrency(item.price)}
                                                    </p>
                                                </div>
                                                <div className="text-right font-medium text-neutral-darkest">
                                                    {formatCurrency(item.quantity * item.price)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="border-t border-neutral-light mt-4 pt-4">
                                    <div className="flex justify-between font-medium text-neutral-darkest">
                                        <span>Subtotal</span>
                                        <span>{formatCurrency(subtotal)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Shipping Info */}
                        {transaction.shipping_method && (
                            <div className="bg-white rounded-lg shadow-card mb-6">
                                <div className="p-4 border-b border-neutral-light">
                                    <h2 className="text-lg font-semibold text-neutral-darkest flex items-center">
                                        <Truck size={18} className="mr-2 text-primary" />
                                        Informasi Pengiriman
                                    </h2>
                                </div>
                                <div className="p-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-neutral-dark mb-1">
                                            Metode Pengiriman
                                        </h3>
                                        <p className="text-neutral-darkest">
                                            {transaction.shipping_method} 
                                            {transaction.shipping_cost && ` (${formatCurrency(transaction.shipping_cost)})`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Payment Info */}
                        <div className="bg-white rounded-lg shadow-card">
                            <div className="p-4 border-b border-neutral-light">
                                <h2 className="text-lg font-semibold text-neutral-darkest flex items-center">
                                    <Receipt size={18} className="mr-2 text-primary" />
                                    Informasi Pembayaran
                                </h2>
                            </div>
                            <div className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-neutral-dark mb-1">
                                            Metode Pembayaran
                                        </h3>
                                        <p className="text-neutral-darkest">
                                            {transaction.payment_method || "Tidak tersedia"}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-neutral-dark mb-1">
                                            Total Pembayaran
                                        </h3>
                                        <p className="text-neutral-darkest font-medium">
                                            {formatCurrency(transaction.total_amount)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Customer Info and Order Timeline */}
                    <div className="lg:col-span-1">
                        {/* Customer Info */}
                        <div className="bg-white rounded-lg shadow-card mb-6">
                            <div className="p-4 border-b border-neutral-light">
                                <h2 className="text-lg font-semibold text-neutral-darkest flex items-center">
                                    <User size={18} className="mr-2 text-primary" />
                                    Informasi Pelanggan
                                </h2>
                            </div>
                            <div className="p-4">
                                <div className="mb-4">
                                    <h3 className="text-sm font-medium text-neutral-dark mb-1">
                                        Nama
                                    </h3>
                                    <p className="text-neutral-darkest">
                                        {transaction.farmer.user.name}
                                    </p>
                                </div>
                                {transaction.farmer.user.email && (
                                    <div className="mb-4">
                                        <h3 className="text-sm font-medium text-neutral-dark mb-1">
                                            Email
                                        </h3>
                                        <p className="text-neutral-darkest">
                                            {transaction.farmer.user.email}
                                        </p>
                                    </div>
                                )}
                                {transaction.farmer.user.phone && (
                                    <div>
                                        <h3 className="text-sm font-medium text-neutral-dark mb-1">
                                            Telepon
                                        </h3>
                                        <div className="flex items-center">
                                            <Phone size={16} className="mr-2 text-neutral" />
                                            <p className="text-neutral-darkest">
                                                {transaction.farmer.user.phone}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Order Timeline */}
                        <div className="bg-white rounded-lg shadow-card">
                            <div className="p-4 border-b border-neutral-light">
                                <h2 className="text-lg font-semibold text-neutral-darkest flex items-center">
                                    <Calendar size={18} className="mr-2 text-primary" />
                                    Detail Transaksi
                                </h2>
                            </div>
                            <div className="p-4">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-neutral-dark mb-1">
                                            Tanggal Pemesanan
                                        </h3>
                                        <p className="text-neutral-darkest">
                                            {format.formatDate(transaction.created_at)}
                                        </p>
                                    </div>
                                    
                                    {transaction.processed_at && (
                                        <div>
                                            <h3 className="text-sm font-medium text-neutral-dark mb-1">
                                                Diproses Pada
                                            </h3>
                                            <p className="text-neutral-darkest">
                                                {format.formatDate(transaction.processed_at)}
                                            </p>
                                        </div>
                                    )}
                                    
                                    {transaction.shipped_at && (
                                        <div>
                                            <h3 className="text-sm font-medium text-neutral-dark mb-1">
                                                Dikirim Pada
                                            </h3>
                                            <p className="text-neutral-darkest">
                                                {format.formatDate(transaction.shipped_at)}
                                            </p>
                                        </div>
                                    )}
                                    
                                    {transaction.delivered_at && (
                                        <div>
                                            <h3 className="text-sm font-medium text-neutral-dark mb-1">
                                                Diterima Pada
                                            </h3>
                                            <p className="text-neutral-darkest">
                                                {format.formatDate(transaction.delivered_at)}
                                            </p>
                                        </div>
                                    )}
                                    
                                    {transaction.cancelled_at && (
                                        <div>
                                            <h3 className="text-sm font-medium text-neutral-dark mb-1">
                                                Dibatalkan Pada
                                            </h3>
                                            <p className="text-neutral-darkest">
                                                {format.formatDate(transaction.cancelled_at)}
                                            </p>
                                        </div>
                                    )}
                                    
                                    {transaction.cancellation_reason && (
                                        <div>
                                            <h3 className="text-sm font-medium text-neutral-dark mb-1">
                                                Alasan Pembatalan
                                            </h3>
                                            <p className="text-neutral-darkest">
                                                {transaction.cancellation_reason}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ShopLayout>
    );
}