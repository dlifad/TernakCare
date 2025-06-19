import React from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import FarmerLayout from "@/Layouts/FarmerLayout";
import { Trash, Minus, Plus, ShoppingCart } from "lucide-react";
import { format } from "@/Components/Common/format";

export default function CartPage({ cartItems, itemsByShop, subtotal }) {
    // Ensure we're passing cart count to the layout
    const { props } = usePage();

    const updateCartItemQuantity = (id, currentQuantity, change) => {
        const newQuantity = currentQuantity + change;
        if (newQuantity < 1) return;

        router.put(
            route("farmer.cart.update", id),
            {
                quantity: newQuantity,
            },
            {
                preserveScroll: true,
            },
        );
    };

    const removeCartItem = (id) => {
        if (
            confirm(
                "Apakah Anda yakin ingin menghapus produk ini dari keranjang?",
            )
        ) {
            router.delete(route("farmer.cart.remove", id), {
                preserveScroll: true,
            });
        }
    };

    const clearCart = () => {
        if (
            confirm("Apakah Anda yakin ingin mengosongkan keranjang belanja?")
        ) {
            router.delete(route("farmer.cart.clear"), {
                preserveScroll: true,
            });
        }
    };

    // Updated to use the correct checkout route as defined in CartController
    const proceedToCheckout = () => {
        // Using cart.checkout route that calls CartController@checkout
        router.get(route("farmer.cart.checkout"));
    };

    const renderEmptyCart = () => (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-neutral-lightest p-6 rounded-full mb-4">
                <ShoppingCart className="h-16 w-16 text-neutral" />
            </div>
            <h2 className="text-xl font-bold text-neutral-dark mb-2">
                Keranjang Belanja Kosong
            </h2>
            <p className="text-neutral mb-6">
                Tambahkan beberapa produk ternak untuk memulai.
            </p>
            <Link
                href={route("farmer.marketplace.index")}
                className="bg-primary hover:bg-primary-dark text-white rounded-lg px-6 py-2 transition duration-200"
            >
                Jelajahi Produk
            </Link>
        </div>
    );

    const renderCartItems = () => (
        <>
            {Object.entries(itemsByShop).map(([shopId, rawItems]) => {
                const items = rawItems.filter(
                    (item) => item?.product && item.product?.shop,
                );
                if (!items.length) return null;

                const shop = items[0].product.shop;
                return (
                    <div
                        key={shopId}
                        className="border border-neutral-light rounded-lg mb-6 overflow-hidden"
                    >
                        <div className="bg-neutral-lightest px-4 py-3 border-b border-neutral-light">
                            <h3 className="font-medium text-neutral-darkest">
                                <Link href="#" className="hover:text-primary">
                                    {shop?.shop_name || "TernakCare"}
                                </Link>
                            </h3>
                        </div>

                        <div className="divide-y divide-neutral-light">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="p-4 flex flex-col sm:flex-row items-start"
                                >
                                    <div className="flex-shrink-0 w-24 h-24 rounded-md overflow-hidden mb-4 sm:mb-0">
                                        {item.product.images &&
                                        item.product.images.length > 0 ? (
                                            <img
                                                src={`/storage/${item.product.images[0].image_path}`}
                                                alt={item.product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : item.product.image ? (
                                            <img
                                                src={`/storage/${item.product.image}`}
                                                alt={item.product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-neutral-light flex items-center justify-center">
                                                <span className="text-neutral-dark text-xs">
                                                    No Image
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-grow sm:ml-6 mb-4 sm:mb-0">
                                        <Link
                                            href={route(
                                                "farmer.marketplace.product.show",
                                                item.product.id,
                                            )}
                                            className="font-medium text-neutral-darkest hover:text-primary"
                                        >
                                            {item.product.name}
                                        </Link>

                                        <div className="text-sm text-neutral mt-1">
                                            {item.product.category}
                                        </div>

                                        <div className="font-medium text-primary mt-2">
                                            {format.formatCurrency(
                                                item.product.price,
                                            )}{" "}
                                            / unit
                                        </div>

                                        <div className="text-sm text-neutral-dark mt-1">
                                            Stok: {item.product.stock}
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:items-end w-full sm:w-auto">
                                        <div className="font-bold text-neutral-darkest mb-3">
                                            {format.formatCurrency(
                                                item.product.price *
                                                    item.quantity,
                                            )}
                                        </div>

                                        <div className="flex items-center">
                                            <button
                                                onClick={() =>
                                                    updateCartItemQuantity(
                                                        item.id,
                                                        item.quantity,
                                                        -1,
                                                    )
                                                }
                                                className="p-1 rounded-md bg-neutral-lightest hover:bg-neutral-light text-neutral-dark"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus size={18} />
                                            </button>

                                            <span className="mx-3 min-w-[40px] text-center">
                                                {item.quantity}
                                            </span>

                                            <button
                                                onClick={() =>
                                                    updateCartItemQuantity(
                                                        item.id,
                                                        item.quantity,
                                                        1,
                                                    )
                                                }
                                                className="p-1 rounded-md bg-neutral-lightest hover:bg-neutral-light text-neutral-dark"
                                                disabled={
                                                    item.quantity >=
                                                    item.product.stock
                                                }
                                            >
                                                <Plus size={18} />
                                            </button>

                                            <button
                                                onClick={() =>
                                                    removeCartItem(item.id)
                                                }
                                                className="ml-4 p-1 rounded-md bg-red-50 hover:bg-red-100 text-red-500"
                                            >
                                                <Trash size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </>
    );

    const renderSummary = () => (
        <div className="bg-white rounded-lg shadow-card p-6 sticky top-6">
            <h3 className="text-lg font-bold text-neutral-darkest mb-4">
                Ringkasan Pesanan
            </h3>

            <div className="space-y-3 mb-4">
                <div className="flex justify-between text-neutral-dark">
                    <span>Total Produk:</span>
                    <span>{cartItems.length} item</span>
                </div>
                <div className="flex justify-between text-neutral-dark">
                    <span>Total Toko:</span>
                    <span>{Object.keys(itemsByShop).length} toko</span>
                </div>
            </div>

            <div className="border-t border-neutral-light my-4 pt-4">
                <div className="flex justify-between font-bold text-neutral-darkest text-lg mb-6">
                    <span>Total:</span>
                    <span>{format.formatCurrency(subtotal)}</span>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={proceedToCheckout}
                        className="w-full bg-primary hover:bg-primary-dark text-white py-2 rounded-lg font-medium transition duration-200"
                        disabled={cartItems.length === 0}
                    >
                        Checkout
                    </button>

                    <button
                        onClick={clearCart}
                        className="w-full border border-red-500 text-red-500 hover:bg-red-50 py-2 rounded-lg font-medium transition duration-200"
                        disabled={cartItems.length === 0}
                    >
                        Kosongkan Keranjang
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <FarmerLayout cartCount={cartItems.length}>
            <Head title="Keranjang Belanja" />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-bold text-neutral-darkest font-heading mb-6">
                    Keranjang Belanja
                </h1>

                {cartItems.length === 0 ? (
                    renderEmptyCart()
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">{renderCartItems()}</div>
                        <div className="lg:col-span-1">{renderSummary()}</div>
                    </div>
                )}
            </div>
        </FarmerLayout>
    );
}