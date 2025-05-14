import React, { useEffect, useState } from "react";
import { Head, Link } from "@inertiajs/react";
import FarmerLayout from "@/Layouts/FarmerLayout";

const PaymentConfirmation = ({ snapToken, product, quantity, total, orderId }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Load Midtrans Snap.js script
        const script = document.createElement("script");
        script.src = "https://app.sandbox.midtrans.com/snap/snap.js"; // Gunakan sandbox untuk testing
        script.setAttribute("data-client-key", import.meta.env.VITE_MIDTRANS_CLIENT_KEY);
        script.async = true;

        script.onload = () => {
            console.log("Midtrans script loaded successfully");
        };

        script.onerror = () => {
            console.error("Failed to load Midtrans script");
            setError("Gagal memuat script Midtrans. Silakan refresh halaman.");
        };

        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    const handleMidtransPayment = () => {
        setIsLoading(true);
        
        if (typeof window.snap === 'undefined') {
            setError("Midtrans tidak tersedia. Silakan refresh halaman.");
            setIsLoading(false);
            return;
        }

        if (!snapToken) {
            setError("Token pembayaran tidak valid.");
            setIsLoading(false);
            return;
        }

        console.log("Initiating payment with token:", snapToken);

        try {
            window.snap.pay(snapToken, {
                onSuccess: function (result) {
                    console.log("Payment Success:", result);
                    window.location.href = route("farmer.activity");
                },
                onPending: function (result) {
                    console.log("Payment Pending:", result);
                    window.location.href = route("farmer.activity");
                },
                onError: function (result) {
                    console.error("Payment Failed:", result);
                    setError("Pembayaran gagal. Silakan coba lagi.");
                    setIsLoading(false);
                },
                onClose: function () {
                    console.log("Customer closed the popup without finishing the payment");
                    setIsLoading(false);
                },
            });
        } catch (e) {
            console.error("Error calling snap.pay:", e);
            setError("Terjadi kesalahan saat menginisiasi pembayaran: " + e.message);
            setIsLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <FarmerLayout>
            <Head title="Pembayaran Pesanan" />

            <div className="max-w-5xl mx-auto py-10 px-4">
                <nav className="text-sm text-gray-500 mb-4">
                    <Link href={route("farmer.activity")} className="hover:underline text-primary">
                        Aktivitas
                    </Link>{" "}
                    / <span className="text-gray-700 font-medium">Pembayaran</span>
                </nav>

                <h1 className="text-2xl font-bold mb-6">Pembayaran Pesanan</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <p>{error}</p>
                    </div>
                )}

                <div className="bg-white rounded shadow-md p-6">
                    <div className="mb-6">
                        <p className="mb-2 text-gray-600">Kode Transaksi</p>
                        <p className="font-semibold">{orderId}</p>
                    </div>

                    <div className="mb-6">
                        <p className="mb-2 text-gray-600">Item</p>
                        <p className="font-semibold">{product?.name} (x{quantity})</p>
                    </div>

                    <div className="mb-6">
                        <p className="mb-2 text-gray-600">Total Pembayaran</p>
                        <p className="text-xl font-bold text-primary-dark">{formatPrice(total)}</p>
                    </div>

                    <div className="mt-8 flex justify-between">
                        <Link
                            href={route("farmer.activity")}
                            className="text-gray-600 hover:underline"
                        >
                            Kembali
                        </Link>

                        <button
                            onClick={handleMidtransPayment}
                            disabled={isLoading}
                            className={`bg-primary-dark text-white px-6 py-2 rounded-md shadow hover:bg-primary-darker transition ${
                                isLoading ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        >
                            {isLoading ? "Memproses..." : "Bayar Sekarang"}
                        </button>
                    </div>
                </div>

                {/* Debug Info - Hapus di production */}
                {import.meta.env.DEV && (
                    <div className="mt-8 p-4 bg-gray-100 rounded">
                        <h3 className="font-bold mb-2">Debug Info:</h3>
                        <p className="text-sm">Snap Token: {snapToken}</p>
                        <p className="text-sm mt-2">Client Key set: {!!import.meta.env.VITE_MIDTRANS_CLIENT_KEY ? "Ya" : "Tidak"}</p>
                    </div>
                )}
            </div>
        </FarmerLayout>
    );
};

export default PaymentConfirmation;