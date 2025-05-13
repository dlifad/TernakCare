import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import FarmerLayout from "@/Layouts/FarmerLayout";
import MarketplaceCard from "@/Components/Farmer/MarketplaceCard";

const Product = ({ product, relatedProducts }) => {
    const [quantity, setQuantity] = useState(1);

    // Format harga ke format mata uang rupiah
    const formatPrice = (price) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(price);
    };

    // Mendapatkan URL gambar dengan placeholder jika tidak ada gambar
    const getImageUrl = (image) => {
        if (image) {
            return `/storage/${image}`;
        }
        return "/images/product-placeholder.jpg";
    };

    // Menangani perubahan kuantitas
    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (value > 0 && value <= product.stock) {
            setQuantity(value);
        }
    };

    // Menangani penambahan kuantitas
    const increaseQuantity = () => {
        if (quantity < product.stock) {
            setQuantity(quantity + 1);
        }
    };

    // Menangani pengurangan kuantitas
    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    return (
        <FarmerLayout>
            <Head title={product.name} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <nav className="flex text-sm text-gray-500 mb-6">
                    <Link href={route('farmer.marketplace')} className="hover:text-primary-dark">
                        Marketplace
                    </Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-700 font-medium">{product.name}</span>
                </nav>

                {/* Product Detail */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-10">
                    <div className="md:flex">
                        {/* Product Image */}
                        <div className="md:w-1/2">
                            <div className="relative pb-[100%] md:pb-0 md:h-full">
                                <img
                                    src={getImageUrl(product.image)}
                                    alt={product.name}
                                    className="absolute inset-0 md:relative w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="md:w-1/2 p-6 md:p-8">
                            <div className="mb-2">
                                <span className="inline-block bg-neutral-lightest text-neutral-dark text-xs rounded-full px-2 py-1">
                                    {product.category}
                                </span>
                            </div>

                            <h1 className="text-2xl md:text-3xl font-bold text-neutral-darkest mb-4">
                                {product.name}
                            </h1>

                            <div className="text-xl md:text-2xl font-bold text-primary-dark mb-6">
                                {formatPrice(product.price)}
                            </div>

                            <div className="mb-6">
                                <h2 className="text-lg font-medium mb-2">Deskripsi</h2>
                                <p className="text-neutral-dark whitespace-pre-line">
                                    {product.description || "Tidak ada deskripsi produk"}
                                </p>
                            </div>

                            <div className="mb-8">
                                <div className="flex items-center mb-4">
                                    <span className="text-sm text-neutral-dark mr-2">Stok:</span>
                                    <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {product.stock > 0 ? `${product.stock} tersedia` : 'Habis'}
                                    </span>
                                </div>

                                {product.stock > 0 && (
                                    <div className="flex items-center mb-6">
                                        <span className="text-sm text-neutral-dark mr-4">Jumlah:</span>
                                        <div className="flex items-center border border-gray-300 rounded">
                                            <button
                                                type="button"
                                                onClick={decreaseQuantity}
                                                className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                                disabled={quantity <= 1}
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                value={quantity}
                                                onChange={handleQuantityChange}
                                                className="w-12 text-center border-0 focus:ring-0"
                                                min="1"
                                                max={product.stock}
                                            />
                                            <button
                                                type="button"
                                                onClick={increaseQuantity}
                                                className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                                disabled={quantity >= product.stock}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <Link
                                    href={route("farmer.marketplace.checkout", {
                                        product_id: product.id,
                                        quantity: quantity,
                                    })}
                                    className={`w-full py-3 px-4 flex justify-center items-center rounded-lg font-medium text-white 
                                    ${product.stock > 0 
                                        ? 'bg-primary-dark hover:bg-primary-darker' 
                                        : 'bg-gray-400 cursor-not-allowed'}`}
                                    disabled={product.stock <= 0}
                                >
                                    {product.stock > 0 ? 'Beli Sekarang' : 'Produk Habis'}
                                </Link>
                            </div>

                            {/* Seller Info */}
                            <div className="border-t border-gray-200 pt-4">
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Dijual oleh</h3>
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden mr-3">
                                        {product.shop?.user?.profile_photo_path ? (
                                            <img
                                                src={`/storage/${product.shop.user.profile_photo_path}`}
                                                alt={product.shop.shop_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold">
                                                {product.shop?.shop_name?.charAt(0) || "T"}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-medium">{product.shop?.shop_name || "TernakCare"}</div>
                                        <div className="text-xs text-gray-500">{product.shop?.address || "Indonesia"}</div>
                                    </div>
                                </div>
                                
                                {/* Shop Location */}
                                <div className="mt-4">
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">Lokasi Toko</h3>
                                    <div className="flex items-start">
                                        <div className="text-primary-dark mr-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div className="text-sm text-neutral-dark">
                                            {product.shop?.shop_address || 
                                             "Alamat tidak tersedia"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mb-10">
                        <h2 className="text-xl font-bold mb-6">Produk Terkait</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((relatedProduct) => (
                                <MarketplaceCard key={relatedProduct.id} product={relatedProduct} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </FarmerLayout>
    );
};

export default Product;