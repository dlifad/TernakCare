import React from "react";
import { Link, router } from "@inertiajs/react";
import { ShoppingCart } from "lucide-react";
import { format } from '@/Components/Common/format';

export default function MarketplaceCard({ product }) {
    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        router.post(route("farmer.cart.add"), {
            product_id: product.id,
            quantity: 1
        }, {
            preserveScroll: true,
        });
    };

    // Periksa struktur data gambar - tambahkan handling untuk kedua kemungkinan struktur
    const getImageUrl = () => {
        // Jika menggunakan struktur images array seperti dalam komponen kedua
        if (product.images && product.images.length > 0) {
            return `/storage/${product.images[0].image_path}`;
        }
        // Jika menggunakan struktur image string seperti dalam komponen pertama
        else if (product.image) {
            return `/storage/${product.image}`;
        }
        // Fallback ke gambar default
        return "/images/default-product.jpg";
    };

    return (
        <Link href={route("farmer.marketplace.product.show", product.id)}>
            <div className="bg-white rounded-lg shadow-card overflow-hidden transition-all duration-200 hover:shadow-lg h-full flex flex-col">
                <div className="relative w-full pb-[75%]">
                    <img
                        src={getImageUrl()}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    {product.stock < 1 && (
                        <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 m-2 rounded">
                            Habis
                        </div>
                    )}
                </div>

                <div className="p-4 flex-grow flex flex-col">
                    <div className="text-xs text-neutral-dark mb-1">{product.category}</div>
                    <h3 className="font-medium text-neutral-darkest mb-2 line-clamp-2">{product.name}</h3>
                    
                    <div className="text-primary font-semibold mt-1 mb-2">{format.formatCurrency(product.price)}</div>
                    
                    <div className="text-xs text-neutral mb-3">
                        { product.shop?.shop_name || "TernakCare"}
                    </div>

                    <div className="mt-auto flex justify-between items-center">
                        <div className="text-xs text-neutral-dark">
                            Stok: {product.stock}
                        </div>

                        <button
                            onClick={handleAddToCart}
                            className="flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 p-2 text-primary transition-colors"
                            title="Tambahkan ke keranjang"
                        >
                            <ShoppingCart size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
}