import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import DoctorLayout from "@/Layouts/DoctorLayout";
import { router } from "@inertiajs/react";
import {
    Search,
    Calendar,
    Clock,
    MessageCircle,
    Video,
    MapPin,
    Download,
    UserCircle,
    Filter,
    ChevronDown,
} from "lucide-react";

export default function DoctorHistory({ completedConsultations, filters, statistics }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || "");
    const [startDate, setStartDate] = useState(filters.start_date || "");
    const [endDate, setEndDate] = useState(filters.end_date || "");
    
    // Fungsi untuk menangani pencarian
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('doctor.history'), {
            search: searchQuery,
            type: filters.type,
            start_date: startDate,
            end_date: endDate
        }, {
            preserveState: true
        });
    };

    // Fungsi untuk filter berdasarkan tipe konsultasi
    const handleTypeFilter = (type) => {
        router.get(route('doctor.history'), {
            search: searchQuery,
            type: type === filters.type ? null : type,
            start_date: startDate,
            end_date: endDate
        }, {
            preserveState: true
        });
    };

    // Fungsi untuk filter berdasarkan tanggal
    const handleDateFilter = () => {
        if (startDate && endDate) {
            router.get(route('doctor.history'), {
                search: searchQuery,
                type: filters.type,
                start_date: startDate,
                end_date: endDate
            }, {
                preserveState: true
            });
        }
    };

    // Fungsi untuk reset filter
    const resetFilters = () => {
        setSearchQuery("");
        setStartDate("");
        setEndDate("");
        router.get(route('doctor.history'), {}, {
            preserveState: true
        });
    };

    // Fungsi untuk mengekspor data
    const handleExport = () => {
        if (startDate && endDate) {
            window.location.href = route('doctor.export', {
                start_date: startDate,
                end_date: endDate
            });
        } else {
            alert("Pilih rentang tanggal untuk mengekspor data");
        }
    };

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

    return (
        <DoctorLayout>
            <Head title="Riwayat Konsultasi" />

            <div className="py-6 px-4 lg:px-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-neutral-darkest">
                        Riwayat Konsultasi
                    </h1>
                    <p className="text-neutral-dark mt-1">
                        Lihat catatan konsultasi yang telah selesai
                    </p>
                </div>

                {/* Filter dan Pencarian */}
                <div className="mb-6 flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[280px]">
                        <form onSubmit={handleSearch} className="relative">
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
                        </form>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <div className="flex items-center space-x-2">
                            <input
                                type="date"
                                className="border border-neutral-light rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <span>-</span>
                            <input
                                type="date"
                                className="border border-neutral-light rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                            <button
                                onClick={handleDateFilter}
                                className="bg-primary text-white px-3 py-2 rounded-md"
                            >
                                Filter
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tipe Konsultasi Filter */}
                <div className="mb-6 flex space-x-2">
                    <button
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${!filters.type ? "bg-primary text-white" : "bg-white border border-neutral-light text-neutral-dark hover:bg-neutral-lightest"}`}
                        onClick={() => handleTypeFilter(null)}
                    >
                        Semua
                    </button>
                    <button
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${filters.type === "chat" ? "bg-primary text-white" : "bg-white border border-neutral-light text-neutral-dark hover:bg-neutral-lightest"}`}
                        onClick={() => handleTypeFilter("chat")}
                    >
                        Chat
                    </button>
                    <button
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${filters.type === "video" ? "bg-primary text-white" : "bg-white border border-neutral-light text-neutral-dark hover:bg-neutral-lightest"}`}
                        onClick={() => handleTypeFilter("video")}
                    >
                        Video
                    </button>
                    <button
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${filters.type === "visit" ? "bg-primary text-white" : "bg-white border border-neutral-light text-neutral-dark hover:bg-neutral-lightest"}`}
                        onClick={() => handleTypeFilter("visit")}
                    >
                        Kunjungan
                    </button>
                    {(filters.type || filters.search || filters.start_date) && (
                        <button
                            className="px-3 py-1 text-sm rounded-md transition-colors bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                            onClick={resetFilters}
                        >
                            Reset Filter
                        </button>
                    )}
                    <div className="ml-auto">
                        <button
                            onClick={handleExport}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            <Download size={16} className="mr-2" />
                            Ekspor Data
                        </button>
                    </div>
                </div>

                {/* Statistik Konsultasi (Opsional) */}
                {statistics && (
                    <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg shadow-card p-4">
                            <h3 className="text-neutral-dark text-sm mb-1">Total Konsultasi</h3>
                            <p className="text-2xl font-semibold text-neutral-darkest">{statistics.total}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-card p-4">
                            <h3 className="text-neutral-dark text-sm mb-1">Chat</h3>
                            <p className="text-2xl font-semibold text-blue-700">{statistics.chat}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-card p-4">
                            <h3 className="text-neutral-dark text-sm mb-1">Video Call</h3>
                            <p className="text-2xl font-semibold text-purple-700">{statistics.video}</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-card p-4">
                            <h3 className="text-neutral-dark text-sm mb-1">Kunjungan</h3>
                            <p className="text-2xl font-semibold text-teal-700">{statistics.visit}</p>
                        </div>
                    </div>
                )}

                {/* Daftar Konsultasi */}
                <div className="bg-white rounded-lg shadow-card overflow-hidden">
                    <div className="divide-y divide-neutral-light">
                        {completedConsultations.data.length > 0 ? (
                            completedConsultations.data.map((consultation) => (
                                <div
                                    key={consultation.id}
                                    className="p-4 hover:bg-neutral-lightest transition-colors"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                                        <div className="flex items-start space-x-4">
                                            <div className="flex-shrink-0">
                                                <UserCircle
                                                    size={48}
                                                    className="text-neutral"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-neutral-darkest">
                                                    {consultation.farmer.user.name}
                                                </h3>
                                                <p className="text-sm text-neutral-dark">
                                                    {consultation.animal_type || "Tidak disebutkan"}
                                                </p>
                                                <div className="mt-1 flex items-center space-x-2">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${consultationTypeClass(
                                                            consultation.type
                                                        )}`}
                                                    >
                                                        {consultationTypeIcon(
                                                            consultation.type
                                                        )}
                                                        {consultationTypeLabel(
                                                            consultation.type
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 lg:mt-0 flex flex-col lg:items-end space-y-2">
                                            <div className="flex items-center text-sm text-neutral-dark">
                                                <Calendar
                                                    size={16}
                                                    className="mr-1"
                                                />
                                                {formatDate(consultation.created_at)}
                                            </div>
                                            <div className="flex items-center text-sm text-neutral-dark">
                                                <Clock
                                                    size={16}
                                                    className="mr-1"
                                                />
                                                {formatTime(consultation.created_at)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-neutral-darkest">
                                                Keluhan:
                                            </h4>
                                            <p className="text-sm text-neutral-dark mt-1">
                                                {consultation.issue || "Tidak ada keluhan yang dicatat"}
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-neutral-darkest">
                                                Status:
                                            </h4>
                                            <p className="text-sm text-neutral-dark mt-1">
                                                {consultation.status}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-end space-x-2">
                                        <a
                                            href={route("doctor.export", {
                                                start_date: consultation.created_at.split("T")[0],
                                                end_date: consultation.created_at.split("T")[0]
                                            })}
                                            className="inline-flex items-center px-4 py-2 border border-primary text-sm font-medium rounded-md text-primary hover:bg-primary-lightest focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                        >
                                            <Download
                                                size={16}
                                                className="mr-2"
                                            />
                                            Unduh Laporan
                                        </a>
                                        <a
                                            href={route("doctor.history.show", consultation.id)}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                        >
                                            Lihat Detail
                                        </a>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center">
                                <p className="text-neutral-dark">
                                    Tidak ada riwayat konsultasi yang ditemukan.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pagination */}
                {completedConsultations.links && completedConsultations.links.length > 3 && (
                    <div className="mt-6 flex justify-center">
                        <nav className="flex items-center">
                            {completedConsultations.links.map((link, index) => (
                                <div key={index}>
                                    {link.url === null ? (
                                        // Disabled link
                                        <span className="px-3 py-1 mx-1 text-gray-400">
                                            {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
                                        </span>
                                    ) : (
                                        // Active or inactive link
                                        <a
                                            href={link.url}
                                            className={`px-3 py-1 mx-1 rounded ${
                                                link.active 
                                                    ? "bg-primary text-white" 
                                                    : "text-primary hover:bg-primary-lightest"
                                            }`}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label.replace('&laquo;', '«').replace('&raquo;', '»')
                                            }}
                                        />
                                    )}
                                </div>
                            ))}
                        </nav>
                    </div>
                )}
            </div>
        </DoctorLayout>
    );
}