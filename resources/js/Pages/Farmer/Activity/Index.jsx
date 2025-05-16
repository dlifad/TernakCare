import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react"; // Tambahkan Link
import FarmerLayout from "@/Layouts/FarmerLayout";
import { format } from "@/Components/Common/format";
import { CalendarDays, Package, Check, X, Clock, FileText, MessageSquare, ChevronRight } from "lucide-react";

export default function ActivityIndex({ auth, consultations, transactions }) {
    const [activeTab, setActiveTab] = useState("all");
    
    // Membuat array gabungan dari konsultasi dan transaksi, lalu urutkan berdasarkan tanggal
    const allActivities = [
        ...consultations.map(item => ({
            ...item,
            type: 'consultation',
            date: new Date(item.created_at)
        })),
        ...transactions.map(item => ({
            ...item,
            type: 'transaction',
            date: new Date(item.created_at)
        }))
    ].sort((a, b) => b.date - a.date);
    
    // Filter aktivitas berdasarkan tab yang aktif
    const filteredActivities = activeTab === "all" 
        ? allActivities 
        : allActivities.filter(item => item.type === activeTab);
    
    // Fungsi untuk menampilkan status dengan format yang sesuai
    const renderStatus = (status, type) => {
        if (type === 'consultation') {
            switch (status) {
                case 'pending':
                    return <div className="flex items-center text-amber-500"><Clock className="w-4 h-4 mr-1" /> Menunggu</div>;
                case 'accepted':
                    return <div className="flex items-center text-green-500"><Check className="w-4 h-4 mr-1" /> Diterima</div>;
                case 'rejected':
                    return <div className="flex items-center text-red-500"><X className="w-4 h-4 mr-1" /> Ditolak</div>;
                case 'completed':
                    return <div className="flex items-center text-blue-500"><Check className="w-4 h-4 mr-1" /> Selesai</div>;
                default:
                    return status;
            }
        } else {
            switch (status) {
                case 'pending':
                    return <div className="flex items-center text-amber-500"><Clock className="w-4 h-4 mr-1" /> Menunggu Pembayaran</div>;
                case 'paid':
                    return <div className="flex items-center text-blue-500"><Check className="w-4 h-4 mr-1" /> Dibayar</div>;
                case 'shipped':
                    return <div className="flex items-center text-green-500"><Package className="w-4 h-4 mr-1" /> Dikirim</div>;
                case 'completed':
                    return <div className="flex items-center text-green-500"><Check className="w-4 h-4 mr-1" /> Selesai</div>;
                case 'cancelled':
                    return <div className="flex items-center text-red-500"><X className="w-4 h-4 mr-1" /> Dibatalkan</div>;
                default:
                    return status;
            }
        }
    };
    
    // Fungsi untuk menampilkan konten berdasarkan tipe aktivitas
    const renderActivityContent = (activity) => {
        if (activity.type === 'consultation') {
            return (
                <Link 
                    href={route('farmer.activity.consultation.show', activity.id)} 
                    className="flex flex-col md:flex-row gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                    <div className="bg-primary-light rounded-full p-3 h-12 w-12 flex-shrink-0">
                        <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-grow">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                            <h3 className="font-semibold text-neutral-darkest">
                                Konsultasi dengan Dr. {activity.doctor?.user?.name || 'Dokter'}
                            </h3>
                            {renderStatus(activity.status, 'consultation')}
                        </div>
                        <p className="text-sm text-neutral mb-2">
                            {activity.description || 'Tidak ada deskripsi'}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs text-neutral-dark">
                            <span className="flex items-center">
                                <CalendarDays className="w-3 h-3 mr-1" />
                                {format.formatDate(activity.created_at)}
                            </span>
                            <span className="flex items-center">
                                <FileText className="w-3 h-3 mr-1" />
                                {activity.is_completed ? 'Konsultasi Selesai' : 'Konsultasi Belum Selesai'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center ml-auto text-neutral">
                        <ChevronRight className="h-5 w-5" />
                    </div>
                </Link>
            );
        } else {
            return (
                <Link 
                    href={route('farmer.activity.transaction.show', activity.id)} 
                    className="flex flex-col md:flex-row gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                    <div className="bg-secondary-light rounded-full p-3 h-12 w-12 flex-shrink-0">
                        <Package className="h-6 w-6 text-secondary" />
                    </div>
                    <div className="flex-grow">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                            <h3 className="font-semibold text-neutral-darkest">
                                {activity.items?.map(item => item.product?.name).join(', ') || `Transaksi #${activity.id}`}
                            </h3>
                            {renderStatus(activity.status, 'transaction')}
                        </div>
                        <p className="text-sm text-neutral mb-2">
                            {activity.items?.reduce((total, item) => total + item.quantity, 0)} item • Total: {format.formatCurrency(activity.total_amount || 0)}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs text-neutral-dark">
                            <span className="flex items-center">
                                <CalendarDays className="w-3 h-3 mr-1" />
                                {format.formatDate(activity.created_at)}
                            </span>
                            {activity.payment_method && (
                                <span className="flex items-center">
                                    <FileText className="w-3 h-3 mr-1" />
                                    Metode Pembayaran: {activity.payment_method}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center ml-auto text-neutral">
                        <ChevronRight className="h-5 w-5" />
                    </div>
                </Link>
            );
        }
    };
    
    return (
        <FarmerLayout user={auth.user}>
            <Head title="Riwayat Aktivitas" />
            
            <div className="bg-white rounded-xl shadow-card p-6 mb-6">
                <h1 className="font-heading text-2xl font-bold text-neutral-darkest mb-6">
                    Riwayat Aktivitas
                </h1>
                
                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 font-medium ${
                            activeTab === 'all'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-neutral-dark hover:text-primary'
                        }`}
                    >
                        Semua
                    </button>
                    <button
                        onClick={() => setActiveTab('consultation')}
                        className={`px-4 py-2 font-medium ${
                            activeTab === 'consultation'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-neutral-dark hover:text-primary'
                        }`}
                    >
                        Konsultasi
                    </button>
                    <button
                        onClick={() => setActiveTab('transaction')}
                        className={`px-4 py-2 font-medium ${
                            activeTab === 'transaction'
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-neutral-dark hover:text-primary'
                        }`}
                    >
                        Transaksi
                    </button>
                </div>
                
                {/* Activity List */}
                <div className="space-y-1">
                    {filteredActivities.length > 0 ? (
                        filteredActivities.map((activity) => (
                            <div key={`${activity.type}-${activity.id}`} className="bg-white rounded-lg">
                                {renderActivityContent(activity)}
                            </div>
                        ))
                    ) : (
                        <div className="py-10 text-center">
                            <p className="text-neutral">Tidak ada riwayat aktivitas</p>
                        </div>
                    )}
                </div>
            </div>
        </FarmerLayout>
    );
}