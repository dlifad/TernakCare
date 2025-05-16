import React from "react";
import { Head, Link } from "@inertiajs/react";
import FarmerLayout from "@/Layouts/FarmerLayout";
import { format } from "@/Components/Common/format";
import { 
    CalendarDays, 
    ArrowLeft, 
    MessageSquare, 
    User, 
    Clock, 
    Check, 
    X, 
    FileText,
    Download,
    Stethoscope
} from "lucide-react";

export default function ConsultationDetail({ auth, consultation }) {
    // Fungsi untuk menampilkan status dengan format yang sesuai
    const renderStatus = (status) => {
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
    };

    return (
        <FarmerLayout user={auth.user}>
            <Head title={`Detail Konsultasi`} />
            
            <div className="bg-white rounded-xl shadow-card p-6 mb-6">
                <div className="flex items-center mb-6">
                    <Link
                        href={route('farmer.activity.index')}
                        className="flex items-center text-neutral-dark hover:text-primary transition-colors mr-4"
                    >
                        <ArrowLeft className="h-5 w-5 mr-1" />
                        <span>Kembali</span>
                    </Link>
                    <h1 className="font-heading text-2xl font-bold text-neutral-darkest">
                        Detail Konsultasi
                    </h1>
                </div>
                
                {/* Ringkasan Konsultasi */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
                        <div className="flex items-center mb-3 md:mb-0">
                            <div className="bg-primary-light rounded-full p-3 h-12 w-12 flex-shrink-0 mr-4">
                                <MessageSquare className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-lg text-neutral-darkest">
                                    Konsultasi #{consultation.id}
                                </h2>
                                <div className="text-sm text-neutral-dark">
                                    {format.formatDate(consultation.created_at)} • {format.formatTime(consultation.created_at)}
                                </div>
                            </div>
                        </div>
                        <div className="bg-white py-2 px-4 rounded-full shadow-sm">
                            {renderStatus(consultation.status)}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Informasi Dokter */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-medium text-neutral-darkest mb-3 flex items-center">
                                <Stethoscope className="h-4 w-4 mr-2 text-primary" />
                                Informasi Dokter
                            </h3>
                            <div className="flex items-center mb-2">
                                <div className="bg-gray-100 rounded-full h-10 w-10 flex items-center justify-center mr-3">
                                    <User className="h-5 w-5 text-neutral" />
                                </div>
                                <div>
                                    <div className="font-medium text-neutral-darkest">
                                        Dr. {consultation.doctor?.user?.name || 'Dokter'}
                                    </div>
                                    <div className="text-sm text-neutral">
                                        {consultation.doctor?.specialization?.name || 'Spesialis'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Informasi Konsultasi */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-medium text-neutral-darkest mb-3 flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-primary" />
                                Detail Konsultasi
                            </h3>
                            <div className="space-y-2">
                                <div className="flex items-start">
                                    <div className="w-28 text-sm text-neutral">Topik:</div>
                                    <div className="flex-1 text-sm text-neutral-darkest">{consultation.topic || '-'}</div>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-28 text-sm text-neutral">Deskripsi:</div>
                                    <div className="flex-1 text-sm text-neutral-darkest">{consultation.description || '-'}</div>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-28 text-sm text-neutral">Status:</div>
                                    <div className="flex-1 text-sm">
                                        {renderStatus(consultation.status)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Lampiran */}
                {consultation.attachments && consultation.attachments.length > 0 && (
                    <div className="border-t border-gray-200 pt-6 mb-6">
                        <h3 className="font-semibold text-neutral-darkest mb-4">Lampiran</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {consultation.attachments.map((attachment, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-3 flex items-center">
                                    <div className="bg-gray-100 rounded-lg h-10 w-10 flex items-center justify-center mr-3">
                                        <FileText className="h-5 w-5 text-neutral" />
                                    </div>
                                    <div className="flex-grow overflow-hidden">
                                        <div className="text-sm font-medium text-neutral-darkest truncate">
                                            {attachment.file_name || `Lampiran ${index + 1}`}
                                        </div>
                                        <div className="text-xs text-neutral">
                                            {attachment.file_size ? format.formatFileSize(attachment.file_size) : ''}
                                        </div>
                                    </div>
                                    <a 
                                        href={attachment.file_url}
                                        download
                                        className="ml-2 bg-gray-100 hover:bg-gray-200 transition-colors rounded-full p-2"
                                        title="Unduh"
                                    >
                                        <Download className="h-4 w-4 text-neutral-dark" />
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Riwayat Pesan */}
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-semibold text-neutral-darkest mb-4">Riwayat Pesan</h3>
                    
                    {consultation.messages && consultation.messages.length > 0 ? (
                        <div className="space-y-4">
                            {consultation.messages.map((message, index) => {
                                const isOwn = message.sender_type === 'App\\Models\\Farmer' && message.sender_id === consultation.farmer_id;
                                
                                return (
                                    <div 
                                        key={index} 
                                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div 
                                            className={`max-w-[80%] rounded-lg p-4 ${
                                                isOwn 
                                                    ? 'bg-primary-light text-neutral-darkest ml-auto' 
                                                    : 'bg-neutral-light text-neutral-darkest mr-auto'
                                            }`}
                                        >
                                            <div className="flex items-center mb-1">
                                                <div className={`text-sm font-medium ${isOwn ? 'text-primary' : 'text-secondary'}`}>
                                                    {isOwn ? 'Anda' : 'Dr. ' + consultation.doctor?.user?.name}
                                                </div>
                                            </div>
                                            <p className="text-sm mb-1">{message.content}</p>
                                            <div className="text-xs text-neutral-dark text-right">
                                                {format.formatTime(message.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-10 text-center">
                            <p className="text-neutral">Belum ada pesan</p>
                        </div>
                    )}
                </div>
            </div>
        </FarmerLayout>
    );
}