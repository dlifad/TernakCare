import React from "react";
import { Link } from "@inertiajs/react";
import { CalendarDays, Package, Check, X, Clock, MessageSquare } from "lucide-react";
import { format } from "@/Components/Common/format";

export default function ActivityHistory({ activity }) {
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

    if (activity.type === 'consultation') {
        return (
            <Link 
                href={route('farmer.consultations.index')} 
                className="flex items-start p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 mb-2 border border-gray-100"
            >
                <div className="bg-primary-light rounded-full p-2 mr-4">
                    <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
                        <h3 className="font-medium text-neutral-darkest">
                            Konsultasi dengan Dr. {activity.doctor?.user?.name || 'Dokter'}
                        </h3>
                        <div className="mt-1 sm:mt-0">
                            {renderStatus(activity.status, 'consultation')}
                        </div>
                    </div>
                    <p className="text-sm text-neutral mb-2 line-clamp-2">
                        {activity.description || 'Tidak ada deskripsi'}
                    </p>
                    <div className="flex items-center text-xs text-neutral-dark">
                        <CalendarDays className="w-3 h-3 mr-1" />
                        <span>{format.formatDate(activity.created_at)}</span>
                    </div>
                </div>
            </Link>
        );
    } else {
        return (
            <Link 
                href={route('farmer.marketplace.payment.success', { id: activity.id })} 
                className="flex items-start p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 mb-2 border border-gray-100"
            >
                <div className="bg-secondary-light rounded-full p-2 mr-4">
                    <Package className="h-5 w-5 text-secondary" />
                </div>
                <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
                        <h3 className="font-semibold text-neutral-darkest">
                            {activity.items?.map(item => item.product?.name).join(', ') || `Transaksi #${activity.id}`}
                        </h3>
                        <div className="mt-1 sm:mt-0">
                            {renderStatus(activity.status, 'transaction')}
                        </div>
                    </div>
                    <p className="text-sm text-neutral mb-2">
                        {activity.items?.reduce((total, item) => total + item.quantity, 0)} item • Total: {format.formatCurrency(activity.total_amount || 0)}
                    </p>
                    <div className="flex items-center text-xs text-neutral-dark">
                        <CalendarDays className="w-3 h-3 mr-1" />
                        <span>{format.formatDate(activity.created_at)}</span>
                    </div>
                </div>
            </Link>
        );
    }
}