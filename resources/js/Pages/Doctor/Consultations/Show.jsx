import React, { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import DoctorLayout from "@/Layouts/DoctorLayout";
import {
    Calendar,
    Clock,
    MessageCircle,
    UserCircle,
    ArrowLeft,
    Video,
    MapPin,
    Send,
    CheckCircle,
} from "lucide-react";

export default function ConsultationShow({ consultation, auth }) {
    const { data, setData, post, processing, reset } = useForm({
        message: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("doctor.consultations.chat.send", consultation.id), {
            onSuccess: () => reset("message"),
        });
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

    return (
        <DoctorLayout user={auth.user}>
            <Head title={`Konsultasi dengan ${consultation.patient_name}`} />

            <div className="py-6 px-4 lg:px-8">
                <div className="mb-4">
                    <Link
                        href={route("doctor.consultations.index")}
                        className="flex items-center text-primary hover:text-primary-dark"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Kembali ke Daftar Konsultasi
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-card overflow-hidden">
                    <div className="p-6 border-b border-neutral-light">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                    <UserCircle size={60} className="text-neutral" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-neutral-darkest">
                                        {consultation.patient_name}
                                    </h2>
                                    <p className="text-neutral-dark">
                                        {consultation.animal_type}
                                    </p>
                                    <div className="mt-2 flex items-center flex-wrap gap-2">
                                        {statusBadge(consultation.status)}
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700`}
                                        >
                                            {consultationTypeIcon(consultation.consultation_type)}
                                            {consultationTypeLabel(consultation.consultation_type)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center text-sm text-neutral-dark">
                                    <Calendar size={16} className="mr-2" />
                                    {consultation.date}
                                </div>
                                <div className="flex items-center text-sm text-neutral-dark">
                                    <Clock size={16} className="mr-2" />
                                    {consultation.time}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-neutral-darkest mb-2">
                                Detail Konsultasi
                            </h3>
                            <div className="bg-neutral-lightest rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-neutral-darkest">
                                            Jenis Konsultasi:
                                        </p>
                                        <p className="text-sm text-neutral-dark">
                                            {consultationTypeLabel(consultation.consultation_type)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-neutral-darkest">
                                            Status:
                                        </p>
                                        <p className="text-sm text-neutral-dark">
                                            {statusBadge(consultation.status)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-neutral-darkest">
                                            Tanggal:
                                        </p>
                                        <p className="text-sm text-neutral-dark">
                                            {consultation.date}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-neutral-darkest">
                                            Waktu:
                                        </p>
                                        <p className="text-sm text-neutral-dark">
                                            {consultation.time}
                                        </p>
                                    </div>
                                    {consultation.location && (
                                        <div className="col-span-2">
                                            <p className="text-sm font-medium text-neutral-darkest">
                                                Lokasi:
                                            </p>
                                            <p className="text-sm text-neutral-dark">
                                                {consultation.location}
                                            </p>
                                        </div>
                                    )}
                                    <div className="col-span-2">
                                        <p className="text-sm font-medium text-neutral-darkest">
                                            Keluhan:
                                        </p>
                                        <p className="text-sm text-neutral-dark">
                                            {consultation.complaint}
                                        </p>
                                    </div>
                                    {consultation.description && (
                                        <div className="col-span-2">
                                            <p className="text-sm font-medium text-neutral-darkest">
                                                Deskripsi:
                                            </p>
                                            <p className="text-sm text-neutral-dark">
                                                {consultation.description}
                                            </p>
                                        </div>
                                    )}
                                    {consultation.notes && (
                                        <div className="col-span-2">
                                            <p className="text-sm font-medium text-neutral-darkest">
                                                Catatan:
                                            </p>
                                            <p className="text-sm text-neutral-dark">
                                                {consultation.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Kolom Chat untuk konsultasi tipe chat yang sudah diapprove */}
                        {consultation.consultation_type === "chat" &&
                            consultation.status === "approved" && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-medium text-neutral-darkest mb-4">
                                        Chat
                                    </h3>
                                    <div className="bg-neutral-lightest rounded-lg p-4 h-96 overflow-y-auto mb-4">
                                        {consultation.chats && consultation.chats.length > 0 ? (
                                            <div className="flex flex-col space-y-4">
                                                {consultation.chats.map((chat) => (
                                                    <div
                                                        key={chat.id}
                                                        className={`flex ${
                                                            chat.sender_type === "doctor"
                                                                ? "justify-end"
                                                                : "justify-start"
                                                        }`}
                                                    >
                                                        <div
                                                            className={`max-w-[70%] p-3 rounded-lg ${
                                                                chat.sender_type === "doctor"
                                                                    ? "bg-primary text-white"
                                                                    : "bg-white border border-neutral-light"
                                                            }`}
                                                        >
                                                            <p className="text-sm">{chat.message}</p>
                                                            <p
                                                                className={`text-xs mt-1 ${
                                                                    chat.sender_type === "doctor"
                                                                        ? "text-primary-light"
                                                                        : "text-neutral"
                                                                }`}
                                                            >
                                                                {chat.created_at}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <p className="text-neutral">
                                                    Belum ada pesan. Mulai chat sekarang!
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <form onSubmit={handleSubmit}>
                                        <div className="flex">
                                            <input
                                                type="text"
                                                className="flex-1 border border-neutral-light rounded-l-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                                placeholder="Ketik pesan..."
                                                value={data.message}
                                                onChange={(e) => setData("message", e.target.value)}
                                                disabled={processing}
                                            />
                                            <button
                                                type="submit"
                                                className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-r-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
                                                disabled={processing || !data.message}
                                            >
                                                <Send size={20} />
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                        {/* Tombol aksi untuk konsultasi */}
                        <div className="mt-8 flex justify-end">
                            {consultation.status === "pending" && (
                                <div className="flex space-x-3">
                                    <Link
                                        href={route("doctor.consultations.reject", consultation.id)}
                                        method="patch"
                                        as="button"
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                    >
                                        Tolak
                                    </Link>
                                    <Link
                                        href={route("doctor.consultations.approve", consultation.id)}
                                        method="patch"
                                        as="button"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                    >
                                        Terima Konsultasi
                                    </Link>
                                </div>
                            )}

                            {consultation.status === "approved" && !consultation.is_completed && (
                                <Link
                                    href={route("doctor.consultations.complete", consultation.id)}
                                    method="patch"
                                    as="button"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    <CheckCircle size={16} className="mr-2" />
                                    Tandai Selesai
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DoctorLayout>
    );
}