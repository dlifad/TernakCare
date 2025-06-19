import React, { useState, useEffect, useRef, useCallback } from "react"; // Tambahkan useCallback
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import FarmerLayout from "@/Layouts/FarmerLayout"; // Pastikan path ini benar
import { format } from "@/Components/Common/format"; // Pastikan util format Anda berfungsi
import {
    Clock,
    MessageCircle,
    Video,
    MapPin,
    ArrowLeft,
    CreditCard,
    MessageSquare, // Mungkin tidak terpakai jika chat terintegrasi
    Send,
} from "lucide-react";

// StatusBadge dan ConsultationTypeIcon bisa jadi helper global jika belum
const StatusBadge = ({ status }) => {
    const statusColors = {
        pending: "bg-yellow-100 text-yellow-800",
        approved: "bg-blue-100 text-blue-800",
        active: "bg-green-100 text-green-800", // atau bg-green-200 text-green-800
        completed: "bg-gray-100 text-gray-800", // atau bg-green-100 text-green-800
        cancelled: "bg-red-100 text-red-800",
        rejected: "bg-red-100 text-red-800",
    };
    const statusLabels = {
        pending: "Menunggu",
        approved: "Disetujui",
        active: "Aktif",
        completed: "Selesai",
        cancelled: "Dibatalkan",
        rejected: "Ditolak",
    };
    return (
        <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                statusColors[status] || "bg-gray-100"
            }`}
        >
            {statusLabels[status] || status}
        </span>
    );
};

const ConsultationTypeIcon = ({ type }) => {
    if (type === "chat") return <MessageCircle className="w-5 h-5 inline mr-1" />;
    if (type === "video" || type === "video_call") return <Video className="w-5 h-5 inline mr-1" />;
    if (type === "visit") return <MapPin className="w-5 h-5 inline mr-1" />;
    return null;
};
// --- End Helper Functions ---

const ConsultationShow = ({ consultation: initialConsultation, auth }) => {
    const { props: pageProps } = usePage(); // Bisa digunakan untuk flash messages atau user global jika perlu
    const loggedInFarmerUserId = auth.user.id; // ID Farmer yang sedang login

    // State untuk daftar pesan. Diinisialisasi dari props.
    const [messages, setMessages] = useState([]); // Mulai dengan array kosong
    const chatContainerRef = useRef(null);

    // State untuk data konsultasi, agar bisa diupdate jika ada perubahan dari Inertia
    // Namun, lebih baik membaca langsung dari `initialConsultation` untuk data non-chat
    // dan hanya `messages` yang di-manage secara terpisah untuk real-time.
    // const [currentConsultation, setCurrentConsultation] = useState(initialConsultation); // Mungkin tidak perlu jika initialConsultation selalu terbaru

    const { data, setData, post, processing, reset, errors: formErrors } = useForm({
        message: "",
    });

    const scrollToBottom = useCallback(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            console.log("[FARMER SCROLL] Scrolled. Container scrollHeight:", chatContainerRef.current.scrollHeight);
        } else {
            console.warn("[FARMER SCROLL] chatContainerRef.current is null or undefined.");
        }
    }, []);

    // Efek untuk inisialisasi dan update messages dari props `initialConsultation.chats`
    useEffect(() => {
        console.log("[FARMER EFFECT PROPS] initialConsultation.chats received:", initialConsultation.chats);
        const newMessages = Array.isArray(initialConsultation.chats) ? initialConsultation.chats : [];
        setMessages(newMessages);
        console.log("[FARMER EFFECT PROPS] messages state initialized/updated from props to:", newMessages);
    }, [initialConsultation.chats]);

    // Efek untuk scroll saat messages berubah
    useEffect(() => {
        console.log("[FARMER EFFECT MESSAGES] messages state changed, new length:", messages.length);
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Efek untuk Laravel Echo
    useEffect(() => {
        if (!initialConsultation || !initialConsultation.id || !window.Echo) {
            if (!initialConsultation || !initialConsultation.id) console.warn("[FARMER ECHO] Consultation ID is missing for Echo subscription.");
            if (!window.Echo) console.warn("[FARMER ECHO] window.Echo is not available.");
            return;
        }

        console.log(`[FARMER ECHO] Attempting to subscribe and listen on channel: private-consultation.${initialConsultation.id}`);
        const channel = window.Echo.private(`consultation.${initialConsultation.id}`);

        const handleNewMessage = (eventData) => {
            console.log("[FARMER ECHO] Event received (.new.chat.message):", eventData);

            // Hanya proses pesan dari orang lain (misal, Dokter)
            if (eventData.sender_id !== loggedInFarmerUserId) {
                setMessages((prevMessages) => {
                    if (eventData.id && !prevMessages.some(msg => msg.id === eventData.id)) {
                        console.log('[FARMER ECHO] Adding new message from Doctor to state:', eventData);
                        return [...prevMessages, eventData];
                    } else if (eventData.id && prevMessages.some(msg => msg.id === eventData.id)){
                        console.log('[FARMER ECHO] Duplicate message from Echo (ID exists), not adding:', eventData.id);
                        return prevMessages;
                    } else if (!eventData.id){
                         console.warn('[FARMER ECHO] Received message without ID from Echo, adding with potential issues:', eventData);
                        return [...prevMessages, { ...eventData, id: `echo-farmer-${Date.now()}-${Math.random()}` }];
                    }
                    return prevMessages;
                });
            } else {
                console.log('[FARMER ECHO] Own message (Farmer) received via Echo, ignoring (should be handled by form success/prop refresh).');
            }
        };

        channel.subscribed(() => {
            console.log(`[FARMER ECHO] Successfully subscribed to private-consultation.${initialConsultation.id}`);
        });
        channel.listen(".new.chat.message", handleNewMessage);
        channel.error((error) => {
            console.error(`[FARMER ECHO] Error subscribing/listening on channel private-consultation.${initialConsultation.id}:`, error);
        });

        return () => {
            console.log(`[FARMER ECHO] Leaving channel: private-consultation.${initialConsultation.id}`);
            if (window.Echo && initialConsultation && initialConsultation.id) {
                channel.stopListening(".new.chat.message", handleNewMessage);
                window.Echo.leave(`consultation.${initialConsultation.id}`);
            }
        };
    }, [initialConsultation.id, loggedInFarmerUserId]);

    const handleSendMessageForFarmer = (e) => {
        e.preventDefault();
        if (!data.message.trim() || processing) return;

        // const messageToSend = data.message; // Disimpan jika mau update manual/optimistik

        post( route("farmer.consultations.messages.send", initialConsultation.id), { // Pastikan NAMA ROUTE BENAR
                onSuccess: (page) => {
                    console.log("[FARMER FORM] Message sent successfully by Farmer. Inertia should refresh props.");
                    reset("message");
                    // Mengandalkan `useEffect` yang memantau `initialConsultation.chats`
                    // untuk mengupdate state `messages` ketika Inertia me-refresh props.
                    // Jika controller melakukan `return back()->with(...)` atau `redirect()`, props akan di-refresh.
                },
                onError: (errors) => {
                    console.error("[FARMER FORM] Error sending message (Farmer):", errors);
                },
                preserveScroll: true, // Coba true atau false
                // preserveState: false, // Coba false jika ingin props selalu di-refresh dari server
            }
        );
    };

    const ActionButton = () => { /* ... Logika ActionButton Anda yang sudah ada, pastikan menggunakan initialConsultation ... */
        if (initialConsultation.is_completed) {
            return ( <div className="mt-6 p-4 bg-green-50 border border-green-300 rounded-md text-green-700 text-center"> Konsultasi ini telah selesai. </div> );
        }
        if (initialConsultation.status !== "approved") {
            return ( <p className="mt-6 text-center text-yellow-600"> Menunggu persetujuan dokter. </p> );
        }
        if (initialConsultation.fee > 0 && !initialConsultation.is_paid) {
            return ( <Link href={route( "farmer.consultations.payment", initialConsultation.id )} className="flex items-center justify-center w-full px-4 py-3 mt-6 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition duration-150 ease-in-out" > <CreditCard className="w-5 h-5 mr-2" /> Bayar Sekarang (Rp{" "} {initialConsultation.fee?.toLocaleString("id-ID") || "0"}) </Link> );
        }
        if ( initialConsultation.is_paid && (initialConsultation.type === "video" || initialConsultation.type === "video_call") ) {
            return ( <Link href={route( "farmer.consultations.join-video", initialConsultation.id )} className="flex items-center justify-center w-full px-4 py-3 mt-6 font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition" > <Video className="w-5 h-5 mr-2" /> Mulai Video Call </Link> );
        }
        return null;
    };

    const showChatInterface =
        initialConsultation.type === "chat" &&
        (initialConsultation.status === "approved" || initialConsultation.status === "active") &&
        ((initialConsultation.fee ?? 0) === 0 || (initialConsultation.is_paid ?? false)) &&
        !initialConsultation.is_completed;

    console.log("[FARMER RENDER] Farmer ConsultationShow. Messages length:", messages.length, "Show Chat UI:", showChatInterface);
    console.log("[FARMER RENDER] initialConsultation details:", initialConsultation);

    return (
        <FarmerLayout user={auth.user}>
            <Head title={`Konsultasi dengan Dr. ${initialConsultation.doctor?.user?.name || "Dokter"}`} />
            <div className="py-6">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link
                            href={route("farmer.activity.index")}
                            className="flex items-center text-primary hover:text-primary-dark"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Kembali ke Aktivitas
                        </Link>
                    </div>

                    <div className="bg-white overflow-hidden shadow-card sm:rounded-lg">
                        <div className="p-6 border-b border-neutral-light">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <img
                                        src={ initialConsultation.doctor?.user?.profile_photo_url || "/storage/images/default-avatar.png" }
                                        alt={initialConsultation.doctor?.user?.name || "Dokter"}
                                        className="w-16 h-16 rounded-full object-cover"
                                    />
                                    <div>
                                        <h2 className="text-xl font-semibold text-neutral-darkest">
                                            Dr. {initialConsultation.doctor?.user?.name || "Dokter"}
                                        </h2>
                                        <div className="flex items-center mt-1 text-sm text-neutral-dark">
                                            <ConsultationTypeIcon type={initialConsultation.type} />
                                            <span className="ml-1 capitalize">
                                                Konsultasi {initialConsultation.type?.replace("_"," ") || "Tidak Diketahui"}
                                            </span>
                                        </div>
                                        <StatusBadge status={initialConsultation.status} />
                                    </div>
                                </div>
                                <div className="text-right text-xs text-neutral-dark">
                                    <p>ID: #{initialConsultation.id}</p>
                                    {initialConsultation.created_at && (
                                        <p>{format.formatDate(initialConsultation.created_at)}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-3 text-neutral-darkest">
                                Detail Konsultasi
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm mb-6">
                                <div>
                                    <p className="text-neutral-dark">Jenis Hewan:</p>
                                    <p className="font-medium text-neutral-darkest">{initialConsultation.animal_type || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-neutral-dark">Keluhan:</p>
                                    <p className="font-medium text-neutral-darkest">{initialConsultation.issue || "-"}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-neutral-dark">Deskripsi:</p>
                                    <p className="font-medium text-neutral-darkest whitespace-pre-wrap">{initialConsultation.description || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-neutral-dark">Biaya:</p>
                                    <p className="font-medium text-neutral-darkest">Rp {initialConsultation.fee?.toLocaleString("id-ID") || "0"}</p>
                                </div>
                                <div>
                                    <p className="text-neutral-dark">Pembayaran:</p>
                                    <p className={`font-medium ${initialConsultation.is_paid ? "text-green-600" : "text-red-600"}`}>
                                        {initialConsultation.is_paid ? "Lunas" : "Belum Lunas"}
                                    </p>
                                </div>
                                {initialConsultation.type !== "chat" && initialConsultation.schedule && (
                                    <div>
                                        <p className="text-neutral-dark">Jadwal:</p>
                                        <p className="font-medium text-neutral-darkest flex items-center">
                                            <Clock size={14} className="mr-1" />
                                            {format.formatDate(initialConsultation.schedule, true)}
                                        </p>
                                    </div>
                                )}
                                {initialConsultation.type === "visit" && initialConsultation.location && (
                                    <div className="md:col-span-2">
                                        <p className="text-neutral-dark">Lokasi Kunjungan:</p>
                                        <p className="font-medium text-neutral-darkest flex items-center">
                                            <MapPin size={14} className="mr-1" />
                                            {initialConsultation.location}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <ActionButton />

                            {/* Kolom Chat untuk Farmer */}
                            {showChatInterface ? (
                                <div className="mt-8 pt-6 border-t border-neutral-light">
                                    <h3 className="text-lg font-medium text-neutral-darkest mb-4">
                                        Chat dengan Dokter
                                    </h3>
                                    <div
                                        ref={chatContainerRef}
                                        className="bg-gray-100 rounded-lg p-4 h-96 overflow-y-auto mb-4 border border-gray-300"
                                    >
                                        {Array.isArray(messages) && messages.length > 0 ? (
                                            <div className="flex flex-col space-y-3">
                                                {messages.map((chat) => {
                                                     if (!chat || typeof chat.id === 'undefined') {
                                                        console.warn("[FARMER RENDER MAP] Invalid chat item, skipping:", chat);
                                                        return null;
                                                    }
                                                    console.log("[FARMER RENDER MAP] Rendering chat item:", chat);
                                                    return (
                                                        <div
                                                            key={chat.id}
                                                            className={`flex ${
                                                                chat.sender_id === loggedInFarmerUserId
                                                                    ? "justify-end"
                                                                    : "justify-start"
                                                            }`}
                                                        >
                                                            <div
                                                                className={`max-w-[70%] py-2 px-3 rounded-xl shadow-sm ${
                                                                    chat.sender_id === loggedInFarmerUserId
                                                                        ? "bg-primary text-white"
                                                                        : "bg-white border border-gray-200 text-neutral-darkest"
                                                                }`}
                                                            >
                                                                <p className="text-sm whitespace-pre-wrap">{chat.message}</p>
                                                                <p className={`text-xs mt-1 opacity-75 ${
                                                                    chat.sender_id === loggedInFarmerUserId ? "text-right" : "text-left"
                                                                }`}>
                                                                    {chat.created_at_formatted || new Date(chat.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-500">
                                                Mulai percakapan dengan dokter.
                                            </div>
                                        )}
                                    </div>
                                    <form onSubmit={handleSendMessageForFarmer}>
                                        <div className="flex items-center">
                                            <input
                                                type="text"
                                                className="flex-1 border border-gray-300 rounded-l-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                                                placeholder="Ketik pesan untuk dokter..."
                                                value={data.message}
                                                onChange={(e) => setData("message", e.target.value)}
                                                disabled={processing}
                                                autoComplete="off"
                                            />
                                            <button
                                                type="submit"
                                                className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-r-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-60 transition-colors"
                                                disabled={processing || !data.message.trim()}
                                            >
                                                <Send size={20} />
                                            </button>
                                        </div>
                                        {formErrors.message && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.message}</p>
                                        )}
                                    </form>
                                </div>
                            ) : (
                                 <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md text-gray-500 text-center">
                                    {initialConsultation.is_completed
                                        ? "Konsultasi chat ini telah selesai."
                                        : "Fitur chat tidak tersedia atau belum dapat dimulai untuk konsultasi ini."}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </FarmerLayout>
    );
};

export default ConsultationShow;