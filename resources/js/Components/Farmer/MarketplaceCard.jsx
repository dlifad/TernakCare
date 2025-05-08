import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import Modal from '@/Components/Common/Modal';
import Button from '@/Components/Common/Button';

export default function MarketplaceCard({ product }) {
    const [showModal, setShowModal] = useState(false);
    const [quantity, setQuantity] = useState(1);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (value > 0 && value <= product.stock) {
            setQuantity(value);
        }
    };

    const incrementQuantity = () => {
        if (quantity < product.stock) {
            setQuantity(quantity + 1);
        }
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setQuantity(1);
    };

    const addToCart = () => {
        // Implement add to cart functionality here
        console.log(`Added ${quantity} of ${product.name} to cart`);
        closeModal();
        
        // You would typically make an API call here to add the item to the cart
        // For example:
        // addToCart({ product_id: product.id, quantity: quantity })
        //     .then(() => {
        //         closeModal();
        //         // Show success notification
        //     })
        //     .catch(error => {
        //         console.error('Error adding to cart:', error);
        //     });
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow-card overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-lg">
                <div className="relative pb-[56.25%]">
                    <img 
                        src={product.image_url || '/images/placeholder-product.jpg'} 
                        alt={product.name}
                        className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                    {product.discount_percentage > 0 && (
                        <div className="absolute top-2 right-2 bg-accent text-white px-2 py-1 rounded-full text-xs font-bold">
                            -{product.discount_percentage}%
                        </div>
                    )}
                </div>
                
                <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-neutral-darkest line-clamp-2 hover:text-primary transition-colors">
                            {product.name}
                        </h3>
                        {product.verified && (
                            <span className="bg-success/10 text-success text-xs px-2 py-1 rounded-full whitespace-nowrap">
                                Terverifikasi
                            </span>
                        )}
                    </div>
                    
                    <p className="text-sm text-neutral mb-2 line-clamp-2">
                        {product.description}
                    </p>
                    
                    <div className="flex items-center text-sm text-neutral mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{product.location || 'Lokasi tidak tersedia'}</span>
                    </div>

                    <div className="flex items-center mb-3">
                        <div className="flex items-center text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-warning" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="ml-1">{product.rating ? product.rating.toFixed(1) : '0.0'}</span>
                        </div>
                        <span className="mx-2 text-neutral">•</span>
                        <span className="text-sm text-neutral">
                            {product.sold || 0} terjual
                        </span>
                    </div>

                    <div className="flex justify-between items-end">
                        <div>
                            {product.discount_price ? (
                                <>
                                    <p className="text-sm line-through text-neutral">
                                        {formatPrice(product.price)}
                                    </p>
                                    <p className="text-lg font-bold text-primary">
                                        {formatPrice(product.discount_price)}
                                    </p>
                                </>
                            ) : (
                                <p className="text-lg font-bold text-primary">
                                    {formatPrice(product.price)}
                                </p>
                            )}
                        </div>
                        
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-primary hover:bg-primary-dark text-white rounded-lg px-3 py-1 text-sm transition duration-200"
                        >
                            Beli
                        </button>
                    </div>

                    <div className="mt-2">
                        <div className="w-full bg-neutral-lightest rounded-full h-1.5">
                            <div 
                                className={`h-1.5 rounded-full ${product.stock < 10 ? 'bg-warning' : 'bg-success'}`}
                                style={{ width: `${Math.min(100, (product.stock / product.initial_stock) * 100)}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-neutral mt-1">
                            Stok: {product.stock} {product.unit || 'item'}
                        </p>
                    </div>
                </div>
            </div>

            <Modal show={showModal} onClose={closeModal} maxWidth="md">
                <div className="p-6">
                    <div className="flex items-start space-x-4">
                        <div className="w-1/3">
                            <img 
                                src={product.image_url || '/images/placeholder-product.jpg'} 
                                alt={product.name}
                                className="w-full h-auto rounded-lg object-cover"
                            />
                        </div>
                        
                        <div className="w-2/3">
                            <h3 className="text-xl font-bold text-neutral-darkest mb-2">
                                {product.name}
                            </h3>
                            
                            <div className="flex items-center text-sm mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-warning" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.799-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="ml-1">{product.rating ? product.rating.toFixed(1) : '0.0'}</span>
                                <span className="mx-2 text-neutral">•</span>
                                <span className="text-neutral">
                                    {product.sold || 0} terjual
                                </span>
                            </div>
                            
                            <p className="text-sm text-neutral mb-4">
                                {product.description}
                            </p>
                            
                            <div className="flex items-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="ml-2 text-sm text-neutral">{product.location || 'Lokasi tidak tersedia'}</span>
                            </div>
                            
                            <div className="mb-4">
                                {product.discount_price ? (
                                    <>
                                        <p className="text-sm line-through text-neutral">
                                            {formatPrice(product.price)}
                                        </p>
                                        <p className="text-2xl font-bold text-primary">
                                            {formatPrice(product.discount_price)}
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-2xl font-bold text-primary">
                                        {formatPrice(product.price)}
                                    </p>
                                )}
                            </div>
                            
                            <div className="flex items-center mb-6">
                                <label className="mr-3 text-neutral-dark">Jumlah:</label>
                                <div className="flex border border-neutral-light rounded-lg">
                                    <button 
                                        type="button"
                                        onClick={decrementQuantity}
                                        className="px-3 py-1 text-lg font-medium text-neutral-dark hover:bg-neutral-lightest"
                                        disabled={quantity <= 1}
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        min="1"
                                        max={product.stock}
                                        value={quantity}
                                        onChange={handleQuantityChange}
                                        className="w-12 text-center border-0 focus:ring-0"
                                    />
                                    <button 
                                        type="button"
                                        onClick={incrementQuantity}
                                        className="px-3 py-1 text-lg font-medium text-neutral-dark hover:bg-neutral-lightest"
                                        disabled={quantity >= product.stock}
                                    >
                                        +
                                    </button>
                                </div>
                                <span className="ml-3 text-sm text-neutral">
                                    Tersedia: {product.stock} {product.unit || 'item'}
                                </span>
                            </div>
                            
                            <div className="flex space-x-3">
                                <Button
                                    onClick={closeModal}
                                    className="w-1/2 bg-neutral-light hover:bg-neutral text-neutral-dark"
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={addToCart}
                                    className="w-1/2 bg-primary hover:bg-primary-dark text-white"
                                >
                                    Tambah ke Keranjang
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}