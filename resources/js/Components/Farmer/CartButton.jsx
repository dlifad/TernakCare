import React from "react";
import { Link } from "@inertiajs/react";
import { ShoppingCart } from "lucide-react";

/**
 * Komponen untuk menampilkan tombol keranjang belanja dengan badge jumlah item
 * 
 * @param {Object} props - Properties yang diteruskan ke komponen
 * @param {number} props.cartCount - Jumlah item dalam keranjang
 * @returns {JSX.Element} Tombol keranjang dengan badge jumlah item
 */
export default function CartButton({ cartCount = 0 }) {
    // Memastikan cartCount adalah number dan bukan string atau undefined
    const count = parseInt(cartCount) || 0;

    return (
        <Link href={route("farmer.cart.index")} className="relative p-1">
            <ShoppingCart className="h-6 w-6 text-neutral-dark hover:text-primary transition-colors" />
            
            {/* Badge jumlah item keranjang, hanya muncul jika ada item */}
            {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {count}
                </span>
            )}
        </Link>
    );
}