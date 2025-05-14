import React, { useState } from "react";
import { Head, Link, useForm, router } from "@inertiajs/react";
import FarmerLayout from "@/Layouts/FarmerLayout";
import { useEffect } from "react";

// Helper functions
const formatPrice = (price) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(price);

const getImageUrl = (image) =>
    image ? `/storage/${image}` : "/images/product-placeholder.jpg";

// Local Component: ShippingForm
const ShippingForm = ({ data, onChange, errors }) => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Informasi Pengiriman</h2>
        <div className="grid grid-cols-1 gap-4">
            <div>
                <label htmlFor="shipping_address" className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat Pengiriman*
                </label>
                <textarea
                    id="shipping_address"
                    name="shipping_address"
                    rows="3"
                    value={data.shipping_address}
                    onChange={onChange}
                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                />
                {errors.shipping_address && <p className="mt-1 text-sm text-red-600">{errors.shipping_address}</p>}
            </div>

            <div>
                <label htmlFor="shipping_phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Telepon*
                </label>
                <input
                    type="text"
                    id="shipping_phone"
                    name="shipping_phone"
                    value={data.shipping_phone}
                    onChange={onChange}
                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                />
                {errors.shipping_phone && <p className="mt-1 text-sm text-red-600">{errors.shipping_phone}</p>}
            </div>

            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Catatan (Opsional)
                </label>
                <textarea
                    id="notes"
                    name="notes"
                    rows="2"
                    value={data.notes}
                    onChange={onChange}
                    className="shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md"
                />
            </div>
        </div>
    </div>
);

// Local Component: OrderSummary
const OrderSummary = ({ product, quantity, total, processing }) => (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
        <h2 className="text-lg font-medium mb-4">Ringkasan Pesanan</h2>

        <div className="mb-6 pb-4 border-b border-gray-200">
            <h3 className="text-sm font-medium mb-2">Dijual oleh</h3>
            <div className="flex items-center">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    {product.shop?.user?.profile_photo_path ? (
                        <img
                            src={`/storage/${product.shop.user.profile_photo_path}`}
                            alt={product.shop.shop_name}
                            className="h-8 w-8 rounded-full"
                        />
                    ) : (
                        <span className="text-xs font-medium">{product.shop?.shop_name?.charAt(0) || "T"}</span>
                    )}
                </div>
                <div className="ml-2">
                    <span className="text-sm font-medium text-gray-900">{product.shop?.shop_name}</span>
                </div>
            </div>
        </div>

        <div className="flex items-start mb-4 pb-4 border-b border-gray-200">
            <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded overflow-hidden">
                <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="ml-4 flex-1">
                <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                <p className="mt-1 text-sm text-gray-500">Jumlah: {quantity}</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{formatPrice(product.price)} / item</p>
            </div>
        </div>

        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(product.price * quantity)}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-gray-600">Biaya Pengiriman</span>
                <span className="font-medium">Gratis</span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between">
                <span className="text-base font-medium text-gray-900">Total</span>
                <span className="text-base font-medium text-primary-dark">{formatPrice(total)}</span>
            </div>
        </div>

        <div className="mt-6">
            <button
                type="submit"
                disabled={processing}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-dark hover:bg-primary-darker focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {processing ? (
                    <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Memproses...
                    </span>
                ) : (
                    "Lanjutkan ke Pembayaran"
                )}
            </button>
        </div>
    </div>
);

// Main Checkout Component
const Checkout = ({ product, quantity, farmer, total }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPaymentInstructions, setShowPaymentInstructions] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        product_id: product.id,
        quantity,
        shipping_address: farmer?.address || "",
        shipping_phone: farmer?.user?.phone || "",
        payment_method: "midtrans", // Default payment method is still midtrans
        notes: "",
    });

    const handleInputChange = (e) => setData(e.target.name, e.target.value);

    // Inject Midtrans Snap Script
    useEffect(() => {
        const script = document.createElement("script");
        const snapEnv = import.meta.env.VITE_MIDTRANS_ENV === 'production'
            ? 'https://app.midtrans.com/snap/snap.js'
            : 'https://app.sandbox.midtrans.com/snap/snap.js';

        script.src = snapEnv;
        script.setAttribute("data-client-key", import.meta.env.VITE_MIDTRANS_CLIENT_KEY);
                script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsProcessing(true);

        // Since we're using only Midtrans, we can simplify this to just one flow
        router.post(route('farmer.marketplace.payment'), data, {
            preserveScroll: true,
            onSuccess: (page) => {
                const snapToken = page.props?.snapToken;
                if (!snapToken) {
                    alert("Gagal mendapatkan token pembayaran.");
                    setIsProcessing(false);
                    return;
                }

                window.snap.pay(snapToken, {
                    onSuccess: function (result) {
                        window.location.href = route("farmer.payment.success");
                    },
                    onPending: function (result) {
                        window.location.href = route("farmer.payment.pending");
                    },
                    onError: function (result) {
                        alert("Terjadi kesalahan saat memproses pembayaran.");
                        setIsProcessing(false);
                    },
                    onClose: function () {
                        setIsProcessing(false);
                        alert("Anda belum menyelesaikan pembayaran.");
                    },
                });
            },
            onError: () => {
                alert("Terjadi kesalahan saat memproses token Midtrans.");
                setIsProcessing(false);
            },
        });
    };

    return (
        <FarmerLayout>
            <Head title="Checkout" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <nav className="flex text-sm text-gray-500 mb-6">
                    <Link href={route("farmer.marketplace")} className="hover:text-primary-dark">
                        Marketplace
                    </Link>
                    <span className="mx-2">/</span>
                    <Link href={route("farmer.marketplace.product", product.id)} className="hover:text-primary-dark">
                        {product.name}
                    </Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-700 font-medium">Checkout</span>
                </nav>

                <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>

                {showPaymentInstructions ? (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Pesanan Berhasil Dibuat!</h2>
                            <p className="text-gray-600">Silakan lakukan pembayaran untuk menyelesaikan pesanan Anda.</p>
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href={route("farmer.activity")} className="btn-primary">
                                Lihat Riwayat Pesanan
                            </Link>
                            <Link href={route("farmer.marketplace")} className="btn-secondary">
                                Kembali ke Marketplace
                            </Link>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6">
                        <div className="lg:w-2/3">
                            <ShippingForm data={data} onChange={handleInputChange} errors={errors} />
                        </div>
                        <div className="lg:w-1/3">
                            <OrderSummary
                                product={product}
                                quantity={quantity}
                                total={total}
                                processing={processing || isProcessing}
                            />
                        </div>
                    </form>
                )}
            </div>
        </FarmerLayout>
    );
};

export default Checkout;