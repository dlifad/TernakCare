import React from "react";
import { Link } from "@inertiajs/react";

const MarketplaceCard = ({ product }) => {
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

    return (
        <div className="bg-white rounded-lg shadow-card overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
            <Link
                href={route("farmer.marketplace.product", product.id)}
                className="block"
            >
                <div className="relative pb-[75%]">
                    <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    {product.stock < 1 ? (
                        <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 m-2 rounded">
                            Habis
                        </div>
                    ) : null}
                </div>

                <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-medium text-neutral-darkest line-clamp-2">
                            {product.name}
                        </h3>
                    </div>

                    <div className="mb-2">
                        <span className="inline-block bg-neutral-lightest text-neutral-dark text-xs rounded-full px-2 py-1">
                            {product.category}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-primary-dark font-bold">
                            {formatPrice(product.price)}
                        </span>
                        <div className="text-xs text-neutral">
                            {product.shop?.shop_name || "TernakCare"}
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default MarketplaceCard;