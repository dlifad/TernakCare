import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import FarmerLayout from "@/Layouts/FarmerLayout";

const PaymentForm = ({ product }) => {
    const [quantity, setQuantity] = useState(1);
    const [phone, setPhone] = useState("");
    
    const { post, processing, errors } = useForm({
        product_id: product.id,
        quantity: 1,
        shipping_phone: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        post(route('farmer.marketplace.snap-token'), {
            data: {
                product_id: product.id,
                quantity: quantity,
                shipping_phone: phone,
            },
        });
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
            <Head title="Form Pembayaran" />

            <div className="max-w-5xl mx-auto py-10 px-4">
                <h1 className="text-2xl font-bold mb-6">Form Pembayaran</h1>

                {errors.snap_error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <p>{errors.snap_error}</p>
                    </div>
                )}

                <div className="bg-white rounded shadow-md p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-4">Detail Produk</h2>
                        <div className="flex items-center">
                            {product.image_url && (
                                <img 
                                    src={product.image_url} 
                                    alt={product.name} 
                                    className="w-20 h-20 object-cover rounded mr-4"
                                />
                            )}
                            <div>
                                <p className="font-semibold">{product.name}</p>
                                <p className="text-gray-600">{formatPrice(product.price)} / item</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2" htmlFor="quantity">
                                Jumlah
                            </label>
                            <input
                                type="number"
                                id="quantity"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value))}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                                required
                            />
                            {errors.quantity && (
                                <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
                            )}
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-700 mb-2" htmlFor="phone">
                                Nomor Telepon
                            </label>
                            <input
                                type="text"
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                                required
                            />
                            {errors.shipping_phone && (
                                <p className="text-red-500 text-sm mt-1">{errors.shipping_phone}</p>
                            )}
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-600">Total Pembayaran</p>
                            <p className="text-xl font-bold text-primary-dark">
                                {formatPrice(product.price * quantity)}
                            </p>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-primary-dark text-white px-6 py-2 rounded-md shadow hover:bg-primary-darker transition disabled:opacity-50"
                            >
                                {processing ? "Memproses..." : "Lanjutkan ke Pembayaran"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </FarmerLayout>
    );
};

export default PaymentForm;