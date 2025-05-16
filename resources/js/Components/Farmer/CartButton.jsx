import React from "react";
import { Link } from "@inertiajs/react";
import { ShoppingCart } from "lucide-react";

const CartButton = ({ cartCount = 0 }) => {
  return (
    <Link 
      href="/farmer/cart" 
      className="relative flex items-center text-neutral-dark hover:text-primary transition-colors duration-200"
    >
      <ShoppingCart className="h-6 w-6" />
      {cartCount > 0 && (
        <div className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {cartCount > 9 ? '9+' : cartCount}
        </div>
      )}
    </Link>
  );
};

export default CartButton;