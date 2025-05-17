import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import DoctorLayout from "@/Layouts/DoctorLayout";
import {
    Search,
    Calendar,
    Clock,
    MessageCircle,
    Filter,
    ChevronDown,
    UserCircle,
    Video,
    MapPin,
    CreditCard,
} from "lucide-react";

export default function DoctorConsultation({ consultations = [], auth, flash }) {
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);

    // Filter consultations based on status, type, and search query
    const filteredConsultations = consultations.filter((consultation) => {
        const matchesStatusFilter =
            statusFilter === "all" || consultation.status === statusFilter;
        const matchesTypeFilter =
            typeFilter === "all" || consultation.consultation_type === typeFilter;
        const matchesSearch =
            consultation.patient_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            consultation.animal_type
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            consultation.complaint
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
        return matchesStatusFilter && matchesTypeFilter && matchesSearch;
    });

    const statusBadge = (status) => {
        const statusConfig = {
            pending: {
                color: "bg-yellow-100 text-yellow-800",
                label: "Menunggu Konfirmasi",
            },
            approved: {
                color: "bg-blue-100 text-blue-800",
                label: "Terjadwal",
            },
            completed: {
                color: "bg-green-100 text-green-800",
                label: "Selesai",
            },
            rejected: {
                color: "bg-red-100 text-red-800",
                label: "Ditolak",
            },
        };

        const config = statusConfig[status] || statusConfig.pending;

        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
            >
                {config.label}
            </span>
        );
    };

    const paymentBadge = (isPaid, paymentStatus) => {
        if (isPaid) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CreditCard size={12} className="mr-1" />
                    Sudah Dibayar
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <CreditCard size={12} className="mr-1" />
                    Belum Dibayar
                </span>
            );
        }
    };

    const consultationTypeIcon = (type) => {
        switch (type) {
            case "chat":
                return <MessageCircle size={16} className="mr-1" />;
            case "video_call":
                return <Video size={16} className="mr-1" />;
            case "visit":
                return <MapPin size={16} className="mr-1" />;
            default:
                return <MessageCircle size={16} className="mr-1" />;
        }
    };

    const consultationTypeLabel = (type) => {
        switch (type) {
            case "chat":
                return "Chat";
            case "video_call":
                return "Video Call";
            case "visit":
                return "Kunjungan";
            default:
                return "Chat";
        }
    };

    const consultationTypeClass = (type) => {
        switch (type) {
            case "chat":
                return "bg-blue-50 text-blue-700";
            case "video_call":
                return "bg-purple-50 text-purple-700";
            case "visit":
                return "bg-teal-50 text-teal-700";
            default:
                return "bg-blue-50 text-blue-700";
        }
    };

    return (
        <DoctorLayout user={auth.user}>
            <Head title="Konsultasi" />

            <div className="py-6 px-4 lg:px-8">
                {/* {flash.message && (
                    <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                        {flash.message}
                    </div>
                )} */}

                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-neutral-darkest">
                        Konsultasi
                    </h1>
                    <p className="text-neutral-dark mt-1">
                        Kelola konsultasi dari peternak
                    </p>
                </div>

                <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={18} className="text-neutral" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-neutral-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            placeholder="Cari nama pasien, jenis hewan, atau keluhan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Filter Type Dropdown */}
                        <div className="relative inline-block text-left">
                            <div>
                                <button
                                    type="button"
                                    className="inline-flex justify-center items-center w-full rounded-md border border-neutral-light px-4 py-2 bg-white text-sm font-medium text-neutral-darkest hover:bg-neutral-lightest focus:outline-none focus:ring-2 focus:ring-primary"
                                    id="filter-type-menu"
                                    aria-expanded={showTypeDropdown}
                                    aria-haspopup="true"
                                    onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                                >
                                    <Filter
                                        size={16}
                                        className="mr-2 text-neutral"
                                    />
                                    Filter Type
                                    <ChevronDown
                                        size={16}
                                        className="ml-2 text-neutral"
                                    />
                                </button>
                            </div>
                            
                            {/* Type Dropdown Menu */}
                            {showTypeDropdown && (
                                <div 
                                    className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                                    role="menu"
                                    aria-orientation="vertical"
                                    aria-labelledby="filter-type-menu"
                                >
                                    <div className="py-1" role="none">
                                        <button
                                            className="block w-full text-left px-4 py-2 text-sm text-neutral-darkest hover:bg-neutral-lightest"
                                            onClick={() => {
                                                setTypeFilter("all");
                                                setShowTypeDropdown(false);
                                            }}
                                        >
                                            Semua Type
                                        </button>
                                        <button
                                            className="block w-full text-left px-4 py-2 text-sm text-neutral-darkest hover:bg-neutral-lightest"
                                            onClick={() => {
                                                setTypeFilter("chat");
                                                setShowTypeDropdown(false);
                                            }}
                                        >
                                            <div className="flex items-center">
                                                <MessageCircle size={16} className="mr-2" />
                                                Chat
                                            </div>
                                        </button>
                                        <button
                                            className="block w-full text-left px-4 py-2 text-sm text-neutral-darkest hover:bg-neutral-lightest"
                                            onClick={() => {
                                                setTypeFilter("video_call");
                                                setShowTypeDropdown(false);
                                            }}
                                        >
                                            <div className="flex items-center">
                                                <Video size={16} className="mr-2" />
                                                Video Call
                                            </div>
                                        </button>
                                        <button
                                            className="block w-full text-left px-4 py-2 text-sm text-neutral-darkest hover:bg-neutral-lightest"
                                            onClick={() => {
                                                setTypeFilter("visit");
                                                setShowTypeDropdown(false);
                                            }}
                                        >
                                            <div className="flex items-center">
                                                <MapPin size={16} className="mr-2" />
                                                Kunjungan
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Status Filter Buttons */}
                        <div className="flex space-x-2">
                            <button
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${statusFilter === "all" ? "bg-primary text-white" : "bg-white border border-neutral-light text-neutral-dark hover:bg-neutral-lightest"}`}
                                onClick={() => setStatusFilter("all")}
                            >
                                Semua
                            </button>
                            <button
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${statusFilter === "pending" ? "bg-primary text-white" : "bg-white border border-neutral-light text-neutral-dark hover:bg-neutral-lightest"}`}
                                onClick={() => setStatusFilter("pending")}
                            >
                                Menunggu
                            </button>
                            <button
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${statusFilter === "approved" ? "bg-primary text-white" : "bg-white border border-neutral-light text-neutral-dark hover:bg-neutral-lightest"}`}
                                onClick={() => setStatusFilter("approved")}
                            >
                                Terjadwal
                            </button>
                            <button
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${statusFilter === "completed" ? "bg-primary text-white" : "bg-white border border-neutral-light text-neutral-dark hover:bg-neutral-lightest"}`}
                                onClick={() => setStatusFilter("completed")}
                            >
                                Selesai
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-card overflow-hidden">
                    <div className="divide-y divide-neutral-light">
                        {filteredConsultations.length > 0 ? (
                            filteredConsultations.map((consultation) => (
                                <div
                                    key={consultation.id}
                                    className="p-4 hover:bg-neutral-lightest transition-colors"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                        <div className="flex items-start space-x-4">
                                            <div className="flex-shrink-0">
                                                <UserCircle
                                                    size={48}
                                                    className="text-neutral"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-neutral-darkest">
                                                    {consultation.patient_name}
                                                </h3>
                                                <p className="text-sm text-neutral-dark">
                                                    {consultation.animal_type}
                                                </p>
                                                <div className="mt-1 flex items-center space-x-2">
                                                    {statusBadge(
                                                        consultation.status,
                                                    )}
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${consultationTypeClass(consultation.consultation_type)}`}
                                                    >
                                                        {consultationTypeIcon(
                                                            consultation.consultation_type,
                                                        )}
                                                        {consultationTypeLabel(
                                                            consultation.consultation_type,
                                                        )}
                                                    </span>
                                                    {paymentBadge(
                                                        consultation.is_paid,
                                                        consultation.payment_status
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 lg:mt-0 flex flex-col lg:items-end space-y-2">
                                            <div className="flex items-center text-sm text-neutral-dark">
                                                <Calendar
                                                    size={16}
                                                    className="mr-1"
                                                />
                                                {consultation.date}
                                            </div>
                                            <div className="flex items-center text-sm text-neutral-dark">
                                                <Clock
                                                    size={16}
                                                    className="mr-1"
                                                />
                                                {consultation.time}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <h4 className="text-sm font-medium text-neutral-darkest">
                                            Keluhan:
                                        </h4>
                                        <p className="text-sm text-neutral-dark mt-1">
                                            {consultation.complaint}
                                        </p>
                                    </div>

                                    <div className="mt-4 flex justify-end">
                                        {consultation.status === "pending" ? (
                                            <div className="space-x-2">
                                                <Link
                                                    href={route('doctor.consultations.approve', consultation.id)}
                                                    method="patch"
                                                    as="button"
                                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                                >
                                                    Terima Konsultasi
                                                </Link>
                                                <Link
                                                    href={route('doctor.consultations.reject', consultation.id)}
                                                    method="patch"
                                                    as="button"
                                                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                                >
                                                    Tolak
                                                </Link>
                                            </div>
                                        ) : (
                                            <Link
                                                href={route('doctor.consultations.show', consultation.id)}
                                                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${!consultation.is_paid ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'}`}
                                                disabled={!consultation.is_paid}
                                                onClick={(e) => {
                                                    if (!consultation.is_paid) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            >
                                                {consultation.consultation_type === "chat" ? (
                                                    <MessageCircle size={16} className="mr-2" />
                                                ) : consultation.consultation_type === "video_call" ? (
                                                    <Video size={16} className="mr-2" />
                                                ) : (
                                                    <MapPin size={16} className="mr-2" />
                                                )}

                                                {!consultation.is_paid 
                                                    ? "Menunggu Pembayaran"
                                                    : consultation.status === "approved"
                                                        ? consultation.consultation_type === "chat"
                                                            ? "Mulai Chat"
                                                            : consultation.consultation_type === "video_call"
                                                                ? "Mulai Video Call"
                                                                : "Lihat Detail Kunjungan"
                                                        : "Lihat Detail"}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center">
                                <p className="text-neutral-dark">
                                    Tidak ada konsultasi yang ditemukan.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DoctorLayout>
    );
}