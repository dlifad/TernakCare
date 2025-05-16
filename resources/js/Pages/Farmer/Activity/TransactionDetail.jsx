import React from "react";
import { Head, Link } from "@inertiajs/react";
import FarmerLayout from "@/Layouts/FarmerLayout";
import { format } from "@/Components/Common/format";
import { 
    ArrowLeft, 
    Package, 
    MapPin, 
    Truck, 
    Clock, 
    Check, 
    X, 
    FileText,
    CreditCard,
    Home,
    ShoppingBag
} from "lucide-react";

export default function TransactionDetail({ auth, transaction }) {
    // Fungsi untuk menampilkan status dengan format yang sesuai
    const renderStatus = (status) => {
        switch (status) {
            case 'pending':
                return <div className="flex items-center text-amber-500"><Clock className="w-4 h-4 mr-1" /> Menunggu Pembayaran</div>;
            case 'paid':
                return <div className="flex items-center text-blue-500"><Check className="w-4 h-4 mr-1" /> Dibayar</div>;
            case 'shipped':
                return <div className="flex items-center text-green-500"><Package className="w-4 h-4 mr-1" /> Dikirim</div>;
            case 'completed':
                return <div className="flex items-center text-green-500"><Check className="w-4 h-4 mr-1" /> Selesai</div>;
            case 'cancelled':
                return <div className="flex items-center text-red-500"><X className="w-4 h-4 mr-1" /> Dibatalkan</div>;
            default:
                return status;
        }
    };

    // Menghitung total jumlah barang
    const totalItems = transaction.items?.reduce((total, item) => total + item.quantity, 0) || 0;

    return (
        <FarmerLayout user={auth.user}>
            <Head title={`Detail Transaksi #${transaction.id}`} />
            
            <div className="bg-white rounded-xl shadow-card p-6 mb-6">
                <div className="flex items-center mb-6">
                    <Link
                        href={route('farmer.activity.index')}
                        className="flex items-center text-neutral-dark hover:text-primary transition-colors mr-4"
                    >
                        <ArrowLeft className="h-5 w-5 mr-1" />
                        <span>Kembali</span>
                    </Link>
                    {/* <h1 className="font-heading text-2xl font-bold text-neutral-darkest">
                        Detail Transaksi #{transaction.id}
                    </h1> */}
                </div>
                
                {/* Ringkasan Transaksi */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
                        <div className="flex items-center mb-3 md:mb-0">
                            <div className="bg-secondary-light rounded-full p-3 h-12 w-12 flex-shrink-0 mr-4">
                                <Package className="h-6 w-6 text-secondary" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-lg text-neutral-darkest">
                                    {transaction.items?.map(item => item.product?.name).join(', ') || `Transaksi #${transaction.id}`}
                                </h2>
                                <div className="text-sm text-neutral-dark">
                                    {format.formatDate(transaction.created_at)} • {totalItems} item
                                </div>
                            </div>
                        </div>
                        <div className="bg-white py-2 px-4 rounded-full shadow-sm">
                            {renderStatus(transaction.status)}
                        </div>
                    </div>
                    
                    {/* Timeline transaksi */}
                    <div className="relative border-l-2 border-dashed border-gray-300 pl-6 ml-2 mb-6">
                        <div className="space-y-6">
                            {/* Pesanan dibuat */}
                            <div className="relative">
                                <div className="absolute -left-8 top-0">
                                    <div className="bg-secondary rounded-full w-4 h-4 border-2 border-white"></div>
                                </div>
                                <div className="mb-1">
                                    <div className="text-sm font-medium text-neutral-darkest flex items-center">
                                        <ShoppingBag className="w-4 h-4 mr-2 text-secondary" /> 
                                        Pesanan Dibuat
                                    </div>
                                </div>
                                <div className="text-xs text-neutral">
                                    {format.formatDate(transaction.created_at)} - {format.formatTime(transaction.created_at)}
                                </div>
                            </div>
                            
                            {/* Pembayaran */}
                            {transaction.status !== 'pending' && (
                                <div className="relative">
                                    <div className="absolute -left-8 top-0">
                                        <div className="bg-secondary rounded-full w-4 h-4 border-2 border-white"></div>
                                    </div>
                                    <div className="mb-1">
                                        <div className="text-sm font-medium text-neutral-darkest flex items-center">
                                            <CreditCard className="w-4 h-4 mr-2 text-secondary" /> 
                                            Pembayaran Diterima
                                        </div>
                                    </div>
                                    <div className="text-xs text-neutral">
                                        {transaction.paid_at ? format.formatDate(transaction.paid_at) + ' - ' + format.formatTime(transaction.paid_at) : '-'}
                                    </div>
                                </div>
                            )}
                            
                            {/* Pengiriman */}
                            {(transaction.status === 'shipped' || transaction.status === 'completed') && (
                                <div className="relative">
                                    <div className="absolute -left-8 top-0">
                                        <div className="bg-secondary rounded-full w-4 h-4 border-2 border-white"></div>
                                    </div>
                                    <div className="mb-1">
                                        <div className="text-sm font-medium text-neutral-darkest flex items-center">
                                            <Truck className="w-4 h-4 mr-2 text-secondary" /> 
                                            Pesanan Dikirim
                                        </div>
                                    </div>
                                    <div className="text-xs text-neutral">
                                        {transaction.shipped_at ? format.formatDate(transaction.shipped_at) + ' - ' + format.formatTime(transaction.shipped_at) : '-'}
                                    </div>
                                </div>
                            )}
                            
                            {/* Pesanan selesai */}
                            {transaction.status === 'completed' && (
                                <div className="relative">
                                    <div className="absolute -left-8 top-0">
                                        <div className="bg-secondary rounded-full w-4 h-4 border-2 border-white"></div>
                                    </div>
                                    <div className="mb-1">
                                        <div className="text-sm font-medium text-neutral-darkest flex items-center">
                                            <Check className="w-4 h-4 mr-2 text-secondary" /> 
                                            Pesanan Selesai
                                        </div>
                                    </div>
                                    <div className="text-xs text-neutral">
                                        {transaction.completed_at ? format.formatDate(transaction.completed_at) + ' - ' + format.formatTime(transaction.completed_at) : '-'}
                                    </div>
                                </div>
                            )}
                            
                            {/* Pesanan dibatalkan */}
                            {transaction.status === 'cancelled' && (
                                <div className="relative">
                                    <div className="absolute -left-8 top-0">
                                        <div className="bg-red-500 rounded-full w-4 h-4 border-2 border-white"></div>
                                    </div>
                                    <div className="mb-1">
                                        <div className="text-sm font-medium text-red-500 flex items-center">
                                            <X className="w-4 h-4 mr-2" /> 
                                            Pesanan Dibatalkan
                                        </div>
                                    </div>
                                    <div className="text-xs text-neutral">
                                        {transaction.cancelled_at ? format.formatDate(transaction.cancelled_at) + ' - ' + format.formatTime(transaction.cancelled_at) : '-'}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Info tambahan */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Informasi Pengiriman */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-medium text-neutral-darkest mb-3 flex items-center">
                                <MapPin className="h-4 w-4 mr-2 text-secondary" />
                                Alamat Pengiriman
                            </h3>
                            {transaction.address ? (
                                <div className="space-y-2 text-sm">
                                    <div className="font-medium">{transaction.address.recipient_name}</div>
                                    <div>{transaction.address.phone_number}</div>
                                    <div>{transaction.address.full_address}</div>
                                    <div>{transaction.address.district}, {transaction.address.city}</div>
                                    <div>{transaction.address.province}, {transaction.address.postal_code}</div>
                                </div>
                            ) : (
                                <div className="text-sm text-neutral">Data alamat tidak tersedia</div>
                            )}
                        </div>
                        
                        {/* Informasi Pembayaran */}
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-medium text-neutral-darkest mb-3 flex items-center">
                                <CreditCard className="h-4 w-4 mr-2 text-secondary" />
                                Informasi Pembayaran
                            </h3>
                            <div className="space-y-2">
                                <div className="flex items-start">
                                    <div className="w-28 text-sm text-neutral">Metode:</div>
                                    <div className="flex-1 text-sm text-neutral-darkest">
                                        {transaction.payment_method || '-'}
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="w-28 text-sm text-neutral">Status:</div>
                                    <div className="flex-1 text-sm">
                                        {transaction.status === 'pending' ? (
                                            <span className="text-amber-500">Menunggu Pembayaran</span>
                                        ) : transaction.status === 'cancelled' ? (
                                            <span className="text-red-500">Dibatalkan</span>
                                        ) : (
                                            <span className="text-green-500">Lunas</span>
                                        )}
                                    </div>
                                </div>
                                {transaction.payments && transaction.payments.length > 0 && (
                                    <div className="flex items-start">
                                        <div className="w-28 text-sm text-neutral">ID Pembayaran:</div>
                                        <div className="flex-1 text-sm text-neutral-darkest">
                                            {transaction.payments[0].payment_id || '-'}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Daftar Produk */}
                <div className="border-t border-gray-200 pt-6 mb-6">
                    <h3 className="font-semibold text-neutral-darkest mb-4">Produk yang Dibeli</h3>
                    <div className="space-y-4">
                        {transaction.items && transaction.items.length > 0 ? (
                            transaction.items.map((item, index) => (
                                <div key={index} className="flex items-center border-b border-gray-100 pb-4">
                                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden mr-4">
                                        {item.product?.images && item.product.images.length > 0 ? (
                                            <img 
                                                src={item.product.images[0].image_url} 
                                                alt={item.product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="h-6 w-6 text-neutral" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-neutral-darkest">{item.product?.name || 'Produk'}</h4>
                                                <div className="text-sm text-neutral">
                                                    {item.quantity} x {format.formatCurrency(item.price || 0)}
                                                </div>
                                            </div>
                                            <div className="font-medium text-neutral-darkest mt-2 md:mt-0">
                                                {format.formatCurrency((item.price || 0) * item.quantity)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-6 text-center">
                                <p className="text-neutral">Tidak ada data produk</p>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Ringkasan Harga */}
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-semibold text-neutral-darkest mb-4">Ringkasan Harga</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-neutral">Subtotal Produk</span>
                            <span className="text-neutral-darkest">
                                {format.formatCurrency(transaction.subtotal || 0)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-neutral">Biaya Pengiriman</span>
                            <span className="text-neutral-darkest">
                                {format.formatCurrency(transaction.shipping_cost || 0)}
                            </span>
                        </div>
                        {transaction.discount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral">Diskon</span>
                                <span className="text-green-500">
                                    -{format.formatCurrency(transaction.discount || 0)}
                                </span>
                            </div>
                        )}
                        <div className="border-t border-gray-200 pt-2 mt-2">
                            <div className="flex justify-between font-semibold">
                                <span>Total</span>
                                <span className="text-primary">
                                    {format.formatCurrency(transaction.total_amount || 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FarmerLayout>
    );
}