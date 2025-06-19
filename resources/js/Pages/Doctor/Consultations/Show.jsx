import React, { useState, useEffect, useRef, useCallback } from "react";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import DoctorLayout from "@/Layouts/DoctorLayout"; // Pastikan path ini benar
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

// --- Helper Functions ---
const getConsultationTypeIcon = (type) => {
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

const getConsultationTypeLabel = (type) => {
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

const getStatusBadge = (status) => {
    const statusConfig = {
        pending: {
            color: "bg-yellow-100 text-yellow-800",
            label: "Menunggu Konfirmasi",
        },
        approved: { color: "bg-blue-100 text-blue-800", label: "Terjadwal" },
        active: { color: "bg-green-200 text-green-800", label: "Aktif" },
        completed: { color: "bg-green-100 text-green-800", label: "Selesai" },
        rejected: { color: "bg-red-100 text-red-800", label: "Ditolak" },
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
// --- End Helper Functions ---

export default function ConsultationShow({
    consultation: initialConsultation,
    auth,
}) {
    const loggedInDoctorUserId = auth.user.id;
    const [messages, setMessages] = useState([]); // Dimulai dengan array kosong, akan diisi oleh useEffect
    const chatContainerRef = useRef(null);

    const {
        data,
        setData,
        post,
        processing,
        reset,
        errors: formErrors,
    } = useForm({
        message: "",
    });

    const scrollToBottom = useCallback(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
                chatContainerRef.current.scrollHeight;
            console.log(
                "[SCROLL] Scrolled. Container scrollHeight:",
                chatContainerRef.current.scrollHeight,
            );
        } else {
            console.warn(
                "[SCROLL] chatContainerRef.current is null or undefined.",
            );
        }
    }, []);

    // Efek untuk inisialisasi dan update messages dari props `initialConsultation.chats`
    useEffect(() => {
        console.log(
            "[EFFECT PROPS] initialConsultation.chats received:",
            initialConsultation.chats,
        );
        // Pastikan initialConsultation.chats adalah array
        const newMessages = Array.isArray(initialConsultation.chats)
            ? initialConsultation.chats
            : [];
        setMessages(newMessages);
        console.log("[EFFECT PROPS] messages state set to:", newMessages);
    }, [initialConsultation.chats]); // Hanya bergantung pada initialConsultation.chats

    // Efek untuk scroll saat messages berubah (setelah state diupdate)
    useEffect(() => {
        console.log(
            "[EFFECT MESSAGES] messages state changed, new length:",
            messages.length,
            "Last message:",
            messages.length > 0 ? messages[messages.length - 1] : "N/A",
        );
        scrollToBottom();
    }, [messages, scrollToBottom]); // Bergantung pada messages dan scrollToBottom

    // Efek untuk Laravel Echo
    useEffect(() => {
        if (!initialConsultation || !initialConsultation.id || !window.Echo) {
            if (!initialConsultation || !initialConsultation.id)
                console.warn(
                    "[ECHO] Consultation ID is missing for Echo subscription.",
                );
            if (!window.Echo)
                console.warn("[ECHO] window.Echo is not available.");
            return;
        }

        const channelName = `consultation.${initialConsultation.id}`;
        const eventName = ".new.chat.message";

        console.log(
            `[ECHO] Attempting to subscribe to channel: private-${channelName} and listen for event: ${eventName}`,
        );
        const channel = window.Echo.private(channelName);

        const handleNewMessage = (eventData) => {
            console.log(
                `[ECHO] Event "<span class="math-inline">\{eventName\}" RECEIVED on "private\-</span>{channelName}":`,
                JSON.stringify(eventData),
            );
            if (eventData.sender_id !== loggedInDoctorUserId) {
                setMessages((prevMessages) => {
                    console.log(
                        "[ECHO SETMESSAGES] Previous messages length:",
                        prevMessages.length,
                    );
                    if (
                        eventData.id &&
                        !prevMessages.some((msg) => msg.id === eventData.id)
                    ) {
                        const updatedMessages = [...prevMessages, eventData];
                        console.log(
                            "[ECHO SETMESSAGES] Adding new message. New messages length:",
                            updatedMessages.length,
                            "New message data:",
                            JSON.stringify(eventData),
                        );
                        return updatedMessages;
                    } else if (
                        eventData.id &&
                        prevMessages.some((msg) => msg.id === eventData.id)
                    ) {
                        console.log(
                            "[ECHO SETMESSAGES] Duplicate message (ID exists), not adding:",
                            eventData.id,
                        );
                        return prevMessages;
                    } else if (!eventData.id) {
                        console.warn(
                            "[ECHO SETMESSAGES] Received message without ID. Adding with temp ID.",
                        );
                        const updatedMessages = [
                            ...prevMessages,
                            {
                                ...eventData,
                                id: `echo-<span class="math-inline">\{Date\.now\(\)\}\-</span>{Math.random()}`,
                            },
                        ];
                        console.log(
                            "[ECHO SETMESSAGES] New messages length after adding temp ID message:",
                            updatedMessages.length,
                        );
                        return updatedMessages;
                    }
                    console.log(
                        "[ECHO SETMESSAGES] No condition met to add message. Returning prevMessages.",
                    );
                    return prevMessages;
                });
            } else {
                console.log(
                    "[ECHO] Own message (Doctor) received via Echo, ignoring (as backend uses .toOthers() and UI update relies on form success/prop refresh).",
                );
            }
        };

        channel.subscribed(() => {
            console.log(
                `[ECHO] Successfully SUBSCRIBED to private-${channelName}`,
            );
        });
        channel.listen(eventName, handleNewMessage);
        channel.error((error) => {
            console.error(
                `[ECHO] Error on channel "private-${channelName}":`,
                error,
            );
        });

        return () => {
            console.log(`[ECHO] Leaving channel: private-${channelName}`);
            if (window.Echo && initialConsultation && initialConsultation.id) {
                channel.stopListening(eventName, handleNewMessage);
                window.Echo.leave(channelName);
            }
        };
    }, [initialConsultation.id, loggedInDoctorUserId]); // Re-subscribe jika ID konsultasi atau ID dokter berubah

    const handleSubmitMessage = (e) => {
        e.preventDefault();
        if (!data.message.trim() || processing) return;

        post(
            route("doctor.consultations.messages.send", initialConsultation.id),
            {
                // Pastikan NAMA ROUTE INI BENAR
                onSuccess: (page) => {
                    console.log(
                        "[FORM ONSUCCESS DOCTOR] Message sent. Inertia should refresh props if backend redirects/returns back.",
                    );
                    reset("message");
                    // Kita mengandalkan `useEffect` yang memantau `initialConsultation.chats`
                    // untuk mengupdate state `messages` ketika Inertia me-refresh props.
                    // Jika props `page.props.consultation` berisi data terbaru, `initialConsultation` akan diupdate oleh Inertia.
                },
                onError: (errors) => {
                    console.error(
                        "[FORM DOCTOR] Error sending message:",
                        errors,
                    );
                },
                preserveScroll: true,
                preserveState: false, // Set ke false untuk memastikan props selalu diambil ulang dari server setelah POST sukses.
                // Ini akan memicu useEffect yang bergantung pada initialConsultation.chats.
            },
        );
    };

    const canChat =
        initialConsultation.consultation_type === "chat" &&
        (initialConsultation.status === "approved" ||
            initialConsultation.status === "active") &&
        !initialConsultation.is_completed &&
        ((initialConsultation.fee ?? 0) === 0 ||
            (initialConsultation.is_paid ?? false));

    console.log(
        "[RENDER DOCTOR] Messages length:",
        messages.length,
        "Can Chat:",
        canChat,
    );
    // console.log("[RENDER DOCTOR] initialConsultation details:", JSON.stringify(initialConsultation, null, 2)); // Hati-hati jika objek besar

    return (
        <DoctorLayout user={auth.user}>
            <Head
                title={`Konsultasi dengan ${initialConsultation.patient_name || "Pasien"}`}
            />
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
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                    <UserCircle
                                        size={60}
                                        className="text-neutral"
                                    />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-neutral-darkest">
                                        {initialConsultation.patient_name ||
                                            "Nama Pasien"}
                                    </h2>
                                    <p className="text-neutral-dark text-sm">
                                        Jenis Hewan:{" "}
                                        {initialConsultation.animal_type || "-"}
                                    </p>
                                    <div className="mt-2 flex items-center flex-wrap gap-2">
                                        {getStatusBadge(
                                            initialConsultation.status,
                                        )}
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700`}
                                        >
                                            {getConsultationTypeIcon(
                                                initialConsultation.consultation_type,
                                            )}
                                            {getConsultationTypeLabel(
                                                initialConsultation.consultation_type,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col space-y-1 text-sm text-neutral-dark md:text-right mt-4 md:mt-0">
                                <div className="flex items-center md:justify-end">
                                    <Calendar size={14} className="mr-2" />
                                    Jadwal: {initialConsultation.date || "-"}
                                </div>
                                <div className="flex items-center md:justify-end">
                                    <Clock size={14} className="mr-2" />
                                    Waktu: {initialConsultation.time || "-"}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-neutral-darkest mb-2">
                                Detail Permintaan
                            </h3>
                            <div className="bg-neutral-lightest rounded-lg p-4 text-sm">
                                <p>
                                    <strong>Keluhan:</strong>{" "}
                                    {initialConsultation.complaint || "-"}
                                </p>
                                {initialConsultation.description && (
                                    <p className="mt-2">
                                        <strong>Deskripsi:</strong>{" "}
                                        {initialConsultation.description}
                                    </p>
                                )}
                                {initialConsultation.notes && (
                                    <p className="mt-2">
                                        <strong>Catatan Dokter:</strong>{" "}
                                        {initialConsultation.notes}
                                    </p>
                                )}
                                {initialConsultation.location &&
                                    initialConsultation.consultation_type ===
                                        "visit" && (
                                        <p className="mt-2">
                                            <strong>Lokasi Kunjungan:</strong>{" "}
                                            {initialConsultation.location}
                                        </p>
                                    )}
                            </div>
                        </div>

                        {/* Kolom Chat */}
                        {canChat ? (
                            <div className="mt-6">
                                <h3 className="text-lg font-medium text-neutral-darkest mb-4">
                                    Chat
                                </h3>
                                <div
                                    ref={chatContainerRef}
                                    className="bg-gray-100 rounded-lg p-4 h-96 overflow-y-auto mb-4 border border-gray-300"
                                >
                                    {Array.isArray(messages) &&
                                    messages.length > 0 ? (
                                        <div className="flex flex-col space-y-3">
                                            {messages.map((chat) => {
                                                if (
                                                    !chat ||
                                                    typeof chat.id ===
                                                        "undefined"
                                                ) {
                                                    console.warn(
                                                        "[RENDER MAP DOCTOR] Invalid chat item, skipping:",
                                                        chat,
                                                    );
                                                    return null;
                                                }
                                                // console.log("[RENDER MAP DOCTOR] Rendering chat item:", chat); // Aktifkan jika masih debug render
                                                return (
                                                    <div
                                                        key={chat.id} // Pastikan ID unik dari server
                                                        className={`flex ${
                                                            chat.sender_id ===
                                                            loggedInDoctorUserId
                                                                ? "justify-end"
                                                                : "justify-start"
                                                        }`}
                                                    >
                                                        <div
                                                            className={`max-w-[70%] py-2 px-3 rounded-xl shadow-sm ${
                                                                chat.sender_id ===
                                                                loggedInDoctorUserId
                                                                    ? "bg-primary text-white"
                                                                    : "bg-white border border-gray-200 text-neutral-darkest"
                                                            }`}
                                                        >
                                                            <p className="text-sm whitespace-pre-wrap">
                                                                {chat.message}
                                                            </p>
                                                            <p
                                                                className={`text-xs mt-1 opacity-75 ${
                                                                    chat.sender_id ===
                                                                    loggedInDoctorUserId
                                                                        ? "text-right"
                                                                        : "text-left"
                                                                }`}
                                                            >
                                                                {chat.created_at_formatted ||
                                                                    (chat.created_at
                                                                        ? new Date(
                                                                              chat.created_at,
                                                                          ).toLocaleTimeString(
                                                                              [],
                                                                              {
                                                                                  hour: "2-digit",
                                                                                  minute: "2-digit",
                                                                              },
                                                                          )
                                                                        : "timestamp error")}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-500">
                                            Belum ada pesan. Mulai percakapan!
                                        </div>
                                    )}
                                </div>

                                <form onSubmit={handleSubmitMessage}>
                                    {/* ... Form Input Pesan ... */}
                                    <div className="flex items-center">
                                        <input
                                            type="text"
                                            className="flex-1 border border-gray-300 rounded-l-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                                            placeholder="Ketik pesan..."
                                            value={data.message}
                                            onChange={(e) =>
                                                setData(
                                                    "message",
                                                    e.target.value,
                                                )
                                            }
                                            disabled={processing}
                                            autoComplete="off"
                                        />
                                        <button
                                            type="submit"
                                            className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-r-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-60 transition-colors"
                                            disabled={
                                                processing ||
                                                !data.message.trim()
                                            }
                                        >
                                            <Send size={20} />
                                        </button>
                                    </div>
                                    {formErrors.message && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {formErrors.message}
                                        </p>
                                    )}
                                </form>
                            </div>
                        ) : (
                            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md text-gray-500 text-center">
                                {initialConsultation.is_completed
                                    ? "Konsultasi chat ini telah ditandai selesai."
                                    : "Fitur chat tidak tersedia untuk konsultasi ini saat ini."}
                            </div>
                        )}

                        {/* Tombol Aksi */}
                        <div className="mt-8 flex justify-end space-x-3">
                            {/* ... Tombol Aksi (Approve, Reject, Complete) ... */}
                            {initialConsultation.status === "pending" && (
                                <>
                                    <Link
                                        href={route(
                                            "doctor.consultations.reject",
                                            initialConsultation.id,
                                        )}
                                        method="patch"
                                        data={{ notes: "Ditolak oleh dokter" }}
                                        as="button"
                                        className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Tolak
                                    </Link>
                                    <Link
                                        href={route(
                                            "doctor.consultations.approve",
                                            initialConsultation.id,
                                        )}
                                        method="patch"
                                        as="button"
                                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark"
                                    >
                                        Terima Konsultasi
                                    </Link>
                                </>
                            )}
                            {(initialConsultation.status === "approved" ||
                                initialConsultation.status === "active") &&
                                !initialConsultation.is_completed && (
                                    <Link
                                        href={route(
                                            "doctor.consultations.complete",
                                            initialConsultation.id,
                                        )}
                                        method="patch"
                                        as="button"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                                    >
                                        {" "}
                                        <CheckCircle
                                            size={16}
                                            className="mr-2"
                                        />{" "}
                                        Tandai Selesai{" "}
                                    </Link>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </DoctorLayout>
    );
}
