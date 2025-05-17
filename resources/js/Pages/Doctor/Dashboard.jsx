import React from "react";
import { Head } from "@inertiajs/react";
import DoctorLayout from "@/Layouts/DoctorLayout";
import ConsultationCard from "@/Components/Doctor/ConsultationCard";
import { Calendar, MessageCircle, Video, Users } from "lucide-react";

export default function Dashboard({ pendingConsultations, stats, todaySchedule }) {
    // Fungsi untuk mendapatkan icon dan warna berdasarkan tipe konsultasi
    const getConsultationTypeInfo = (type) => {
        switch (type) {
            case "chat":
                return {
                    icon: <MessageCircle size={20} className="text-primary" />,
                    bgColor: "bg-primary-light",
                };
            case "video_call":
                return {
                    icon: <Video size={20} className="text-accent" />,
                    bgColor: "bg-accent-light",
                };
            case "visit":
                return {
                    icon: <Calendar size={20} className="text-warning" />,
                    bgColor: "bg-warning bg-opacity-20",
                };
            default:
                return {
                    icon: <MessageCircle size={20} className="text-primary" />,
                    bgColor: "bg-primary-light",
                };
        }
    };

    // Debug - tambahkan log untuk melihat data yang diterima
    console.log("Stats:", stats);
    console.log("Pending Consultations:", pendingConsultations);
    console.log("Today Schedule:", todaySchedule);

    return (
        <DoctorLayout>
            <Head title="Dashboard Dokter" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-heading font-semibold text-neutral-darkest">
                        Dashboard Dokter
                    </h1>

                    {/* Stats */}
                    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="bg-white overflow-hidden shadow-soft rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 rounded-md p-3 bg-secondary-light">
                                        <Users size={24} className="text-secondary" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-neutral truncate">
                                                Total Konsultasi
                                            </dt>
                                            <dd>
                                                <div className="text-lg font-semibold text-neutral-darkest">
                                                    {stats.totalConsultations}
                                                </div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-soft rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 rounded-md p-3 bg-primary-light">
                                        <MessageCircle size={24} className="text-primary" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-neutral truncate">
                                                Konsultasi Chat
                                            </dt>
                                            <dd>
                                                <div className="text-lg font-semibold text-neutral-darkest">
                                                    {stats.chatConsultations}
                                                </div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-soft rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 rounded-md p-3 bg-accent-light">
                                        <Video size={24} className="text-accent" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-neutral truncate">
                                                Konsultasi Video
                                            </dt>
                                            <dd>
                                                <div className="text-lg font-semibold text-neutral-darkest">
                                                    {stats.videoConsultations}
                                                </div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-soft rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 rounded-md p-3 bg-warning bg-opacity-20">
                                        <Calendar size={24} className="text-warning" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-neutral truncate">
                                                Kunjungan Peternakan
                                            </dt>
                                            <dd>
                                                <div className="text-lg font-semibold text-neutral-darkest">
                                                    {stats.visitConsultations}
                                                </div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pending Consultations */}
                    <div className="mt-8">
                        <h2 className="text-xl font-heading font-medium text-neutral-darkest mb-4">
                            Konsultasi Tertunda
                        </h2>

                        <div className="space-y-4">
                            {pendingConsultations && pendingConsultations.length > 0 ? (
                                pendingConsultations.map((consultation) => (
                                    <ConsultationCard
                                        key={consultation.id}
                                        consultation={consultation}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-12 bg-white rounded-lg shadow-soft">
                                    <div className="text-neutral">
                                        Tidak ada konsultasi tertunda saat ini
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Schedule for today */}
                    <div className="mt-8">
                        <h2 className="text-xl font-heading font-medium text-neutral-darkest mb-4">
                            Jadwal Hari Ini
                        </h2>

                        <div className="bg-white shadow-soft rounded-lg overflow-hidden">
                            <div className="divide-y divide-neutral-light">
                                {todaySchedule && todaySchedule.length > 0 ? (
                                    todaySchedule.map((appointment) => {
                                        const typeInfo = getConsultationTypeInfo(appointment.type);
                                        return (
                                            <div key={appointment.id} className="p-6 flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className={`${typeInfo.bgColor} p-2 rounded-md`}>
                                                        {typeInfo.icon}
                                                    </div>
                                                    <div className="ml-4">
                                                        <h3 className="text-sm font-medium text-neutral-darkest">
                                                            {appointment.type === 'chat' ? 'Chat dengan ' : 
                                                             appointment.type === 'video_call' ? 'Panggilan Video dengan ' : 
                                                             'Kunjungan ke Peternakan '}
                                                            {appointment.farmerName}
                                                        </h3>
                                                        <p className="text-xs text-neutral mt-1">
                                                            {appointment.time} - {appointment.issue}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span
                                                    className={`px-3 py-1 text-xs rounded-full ${
                                                        appointment.status === "completed"
                                                            ? "bg-success bg-opacity-10 text-success"
                                                            : "bg-warning bg-opacity-10 text-warning"
                                                    }`}
                                                >
                                                    {appointment.status === "completed"
                                                        ? "Selesai"
                                                        : "Akan Datang"}
                                                </span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="p-6 text-center">
                                        <div className="text-neutral">
                                            Tidak ada jadwal konsultasi hari ini
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DoctorLayout>
    );
}