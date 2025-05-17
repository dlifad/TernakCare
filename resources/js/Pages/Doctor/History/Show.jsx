import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import DoctorLayout from "@/Layouts/DoctorLayout";
import { 
    Calendar, 
    Clock, 
    MessageCircle, 
    Video,
    MapPin, 
    Download, 
    UserCircle,
    ArrowLeft,
    Check,
    Image,
    Paperclip,
    ChevronDown,
    ChevronUp,
    DollarSign
} from "lucide-react";

export default function ConsultationDetail({ consultation, previousConsultation }) {
    const [showChats, setShowChats] = useState(true);
    
    // Fungsi untuk mendapatkan ikon berdasarkan tipe konsultasi
    const consultationTypeIcon = (type) => {
        switch (type) {
            case "chat":
                return <MessageCircle size={16} className="mr-1" />;
            case "video":
                return <Video size={16} className="mr-1" />;
            case "visit":
                return <MapPin size={16} className="mr-1" />;
            default:
                return <MessageCircle size={16} className="mr-1" />;
        }
    };

    // Fungsi untuk mendapatkan label tipe konsultasi dalam bahasa Indonesia
    const consultationTypeLabel = (type) => {
        switch (type) {
            case "chat":
                return "Chat";
            case "video":
                return "Video Call";
            case "visit":
                return "Kunjungan";
            default:
                return "Chat";
        }
    };

    // Fungsi untuk mendapatkan kelas CSS berdasarkan tipe konsultasi
    const consultationTypeClass = (type) => {
        switch (type) {
            case "chat":
                return "bg-blue-50 text-blue-700";
            case "video":
                return "bg-purple-50 text-purple-700";
            case "visit":
                return "bg-teal-50 text-teal-700";
            default:
                return "bg-blue-50 text-blue-700";
        }
    };

    // Fungsi untuk memformat tanggal
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    // Fungsi untuk memformat waktu
    const formatTime = (dateString) => {
        const options = { hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleTimeString('id-ID', options);
    };

    // Fungsi untuk memformat mata uang
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    // Fungsi untuk menghitung biaya setelah diskon 5%
    const calculateDiscountedFee = (originalFee) => {
        if (!originalFee) return 0;
        const discountAmount = originalFee * 0.05;
        return originalFee - discountAmount;
    };

    // Fungsi untuk mengekspor data
    const handleExport = () => {
        window.location.href = route('doctor.export', {
            start_date: consultation.created_at.split("T")[0],
            end_date: consultation.created_at.split("T")[0]
        });
    };

    // Render chat message
    const renderChatMessage = (chat, index) => {
        const isDoctor = chat.sender_role === 'doctor';
        
        return (
            <div 
                key={chat.id} 
                className={`flex ${isDoctor ? 'justify-end' : 'justify-start'} mb-4`}
            >
                <div className={`flex items-start max-w-3/4 ${isDoctor ? 'flex-row-reverse' : ''}`}>
                    <div className="flex-shrink-0 mr-3">
                        <UserCircle size={40} className={`${isDoctor ? 'text-primary' : 'text-neutral'}`} />
                    </div>
                    <div>
                        <div className={`px-4 py-2 rounded-lg ${isDoctor 
                            ? 'bg-primary text-white rounded-tr-none' 
                            : 'bg-neutral-lightest text-neutral-darkest rounded-tl-none'}`}
                        >
                            <p>{chat.message}</p>
                            {chat.attachments && chat.attachments.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    {chat.attachments.map((attachment, idx) => (
                                        <div key={idx} className="flex items-center">
                                            <Paperclip size={14} className="mr-1" />
                                            <a 
                                                href={attachment.url} 
                                                target="_blank" 
                                                className="text-sm underline"
                                                rel="noreferrer"
                                            >
                                                {attachment.name}
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className={`text-xs text-neutral-dark mt-1 ${isDoctor ? 'text-right' : ''}`}>
                            {formatTime(chat.created_at)}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Menentukan apakah riwayat percakapan harus ditampilkan berdasarkan tipe konsultasi
    const shouldShowChatHistory = consultation.type === "chat";

    return (
        <DoctorLayout>
            <Head title={`Detail Konsultasi dengan ${consultation.farmer.user.name}`} />

            <div className="py-6 px-4 lg:px-8">
                {/* Header & Breadcrumb */}
                <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-2">
                        <a 
                            href={route('doctor.history')} 
                            className="text-primary hover:text-primary-dark flex items-center"
                        >
                            <ArrowLeft size={18} className="mr-1" />
                            Kembali ke Riwayat
                        </a>
                    </div>
                    <h1 className="text-2xl font-semibold text-neutral-darkest">
                        Detail Konsultasi
                    </h1>
                    <p className="text-neutral-dark mt-1">
                        Riwayat konsultasi dengan {consultation.farmer.user.name}
                    </p>
                </div>

                {/* Informasi Konsultasi */}
                <div className="bg-white rounded-lg shadow-card overflow-hidden mb-6">
                    <div className="p-6 border-b border-neutral-light">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                            {/* Informasi Peternak */}
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                    <UserCircle size={64} className="text-neutral" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-medium text-neutral-darkest">
                                        {consultation.farmer.user.name}
                                    </h3>
                                    <p className="text-neutral-dark">
                                        Peternak
                                    </p>
                                    <div className="mt-2 flex items-center space-x-2">
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${consultationTypeClass(consultation.type)}`}
                                        >
                                            {consultationTypeIcon(consultation.type)}
                                            {consultationTypeLabel(consultation.type)}
                                        </span>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-green-50 text-green-700">
                                            <Check size={14} className="mr-1" />
                                            Selesai
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Informasi Waktu */}
                            <div className="mt-4 md:mt-0 flex flex-col space-y-2">
                                <div className="flex items-center text-sm text-neutral-dark">
                                    <Calendar size={16} className="mr-1" />
                                    {formatDate(consultation.created_at)}
                                </div>
                                <div className="flex items-center text-sm text-neutral-dark">
                                    <Clock size={16} className="mr-1" />
                                    {formatTime(consultation.created_at)}
                                </div>
                                <button
                                    onClick={handleExport}
                                    className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                >
                                    <Download size={14} className="mr-1" />
                                    Unduh Laporan
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Detail Konsultasi */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-neutral-darkest mb-2">
                                    Jenis Hewan:
                                </h4>
                                <p className="text-neutral-dark">
                                    {consultation.animal_type || "Tidak disebutkan"}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-neutral-darkest mb-2">
                                    Status:
                                </h4>
                                <p className="text-neutral-dark">
                                    {consultation.status}
                                </p>
                            </div>
                            <div className="md:col-span-2">
                                <h4 className="text-sm font-medium text-neutral-darkest mb-2">
                                    Keluhan:
                                </h4>
                                <p className="text-neutral-dark">
                                    {consultation.issue || "Tidak ada keluhan yang dicatat"}
                                </p>
                            </div>
                            
                            {/* Informasi Biaya dengan Diskon 5% */}
                            <div className="md:col-span-2 border-t border-neutral-light pt-4 mt-2">
                                <h4 className="text-sm font-medium text-neutral-darkest mb-3">
                                    Informasi Biaya:
                                </h4>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <div className="flex items-center text-green-700 mb-2">
                                        <DollarSign size={18} className="mr-2" />
                                        <span className="font-medium">Detail Pembayaran</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-neutral-dark">Biaya Konsultasi:</p>
                                            <p className="text-lg font-medium text-neutral-darkest">
                                                {formatCurrency(consultation.fee || 0)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-neutral-dark">Biaya Setelah Potongan (5%):</p>
                                            <p className="text-lg font-medium text-green-700">
                                                {formatCurrency(calculateDiscountedFee(consultation.fee || 0))}
                                            </p>
                                            <p className="text-xs text-neutral-dark mt-1">
                                                *Potongan 5% telah diterapkan
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Riwayat Chat - hanya tampilkan jika tipe konsultasi adalah chat */}
                        {shouldShowChatHistory && (
                            <div className="mt-8">
                                <div 
                                    className="flex justify-between items-center mb-4 cursor-pointer"
                                    onClick={() => setShowChats(!showChats)}
                                >
                                    <h3 className="text-lg font-medium text-neutral-darkest">
                                        Riwayat Percakapan
                                    </h3>
                                    {showChats ? (
                                        <ChevronUp size={20} className="text-neutral" />
                                    ) : (
                                        <ChevronDown size={20} className="text-neutral" />
                                    )}
                                </div>
                                
                                {showChats && (
                                    <div className="bg-neutral-lightest rounded-lg p-4">
                                        {consultation.chats && consultation.chats.length > 0 ? (
                                            <div className="space-y-4">
                                                {consultation.chats.map((chat, index) => 
                                                    renderChatMessage(chat, index)
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-center text-neutral-dark py-4">
                                                Tidak ada riwayat percakapan untuk konsultasi ini.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DoctorLayout>
    );
}