import React, { useState } from "react";
import { 
    ShoppingBag, 
    Truck, 
    Package, 
    CheckCircle, 
    XCircle,
    User,
    MapPin,
    Phone,
    Calendar,
    CreditCard,
    Clock
} from "lucide-react";
import ShopLayout from "@/Layouts/ShopLayout";
import { Head, useForm } from "@inertiajs/react";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function TransactionShow({ auth, transaction, shopItems, statuses }) {
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        status: transaction.status,
        tracking_number: transaction.tracking_number || '',
        shipping_notes: transaction.shipping_notes || '',
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return format(date, 'd MMMM yyyy, HH:mm', { locale: id });
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case "pending":
                return "bg-warning/20 text-warning";
            case "processing":
                return "bg-info/20 text-info";
            case "shipped":
                return "bg-success/20 text-success";
            case "delivered":
                return "bg-primary/20 text-primary-dark";
            case "cancelled":
                return "bg-danger/20 text-danger";
            default:
                return "bg-neutral-light text-neutral-dark";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "pending":
                return <Clock className="w-5 h-5 text-warning" />;
            case "processing":
                return <Package className="w-5 h-5 text-info" />;
            case "shipped":
                return <Truck className="w-5 h-5 text-success" />;
            case "delivered":
                return <CheckCircle className="w-5 h-5 text-primary-dark" />;
            case "cancelled":
                return <XCircle className="w-5 h-5 text-danger" />;
            default:
                return <ShoppingBag className="w-5 h-5 text-neutral-dark" />;
        }
    };

    const handleUpdateStatus = (e) => {
        e.preventDefault();
        post(route('shop.transactions.update-status', transaction.id), {
            onSuccess: () => {
                setIsUpdateModalOpen(false);
                reset();
            }
        });
    };

    // Calculate total items sold by this shop
    const shopTotal = shopItems.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
    }, 0);

    return (
        <ShopLayout user={auth.user}>
            <Head title={`Transaksi #${transaction.id}`} />
            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold font-heading text-neutral-darkest">
                            Detail Transaksi
                        </h1>
                        <p className="text-neutral-dark">
                            Nomor transaksi: TRX-{String(transaction.id).padStart(3, '0')}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <a
                            href={route('shop.transactions.index')}
                            className="inline-flex items-center px-4 py-2 border border-neutral-light rounded-md text-sm font-medium text-neutral-dark hover:bg-neutral-lightest"
                        >
                            Kembali
                        </a>
                        {(transaction.status === "pending" || transaction.status === "processing") && (
                            <button
                                onClick={() => setIsUpdateModalOpen(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
                            >
                                Update Status
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Status Pesanan */}
                    <div className="lg:col-span-3 bg-white rounded-lg shadow-card p-6">
                        <h2 className="text-lg font-medium text-neutral-darkest mb-4">Status Pesanan</h2>
                        <div className="flex items-center">
                            <div className={`mr-4 p-3 rounded-full ${getStatusBadgeClass(transaction.status)}`}>
                                {getStatusIcon(transaction.status)}
                            </div>
                            <div>
                                <p className="font-medium text-neutral-darkest">
                                    {statuses[transaction.status]}
                                </p>
                                <p className="text-sm text-neutral-dark">
                                    Diupdate pada: {formatDate(transaction.updated_at)}
                                </p>
                            </div>
                        </div>
                        
                        {transaction.tracking_number && (
                            <div className="mt-4 p-4 border border-neutral-light rounded-lg bg-neutral-lightest">
                                <div className="flex items-center">
                                    <Truck className="w-5 h-5 text-neutral-dark mr-2" />
                                    <span className="font-medium text-neutral-darkest">Nomor Resi: {transaction.tracking_number}</span>
                                </div>
                                {transaction.shipping_notes && (
                                    <p className="mt-2 text-sm text-neutral-dark">
                                        Catatan: {transaction.shipping_notes}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Informasi Pembeli */}
                    <div className="bg-white rounded-lg shadow-card p-6">
                        <h2 className="text-lg font-medium text-neutral-darkest mb-4">Informasi Pembeli</h2>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <User className="w-5 h-5 text-neutral-dark mr-3 mt-0.5" />
                                <div>
                                    <p className="font-medium text-neutral-darkest">{transaction.farmer.user.name}</p>
                                    <p className="text-sm text-neutral-dark">Peternak</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <Phone className="w-5 h-5 text-neutral-dark mr-3 mt-0.5" />
                                <div>
                                    <p className="font-medium text-neutral-darkest">{transaction.farmer.user.phone || '-'}</p>
                                    <p className="text-sm text-neutral-dark">Telepon</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <MapPin className="w-5 h-5 text-neutral-dark mr-3 mt-0.5" />
                                <div>
                                    <p className="text-neutral-darkest">{transaction.shipping_address || transaction.farmer.user.address || '-'}</p>
                                    <p className="text-sm text-neutral-dark">Alamat Pengiriman</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Informasi Pembayaran */}
                    <div className="bg-white rounded-lg shadow-card p-6">
                        <h2 className="text-lg font-medium text-neutral-darkest mb-4">Informasi Pembayaran</h2>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <CreditCard className="w-5 h-5 text-neutral-dark mr-3 mt-0.5" />
                                <div>
                                    <p className="font-medium text-neutral-darkest">Transfer Bank</p>
                                    <p className="text-sm text-neutral-dark">Metode Pembayaran</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <Calendar className="w-5 h-5 text-neutral-dark mr-3 mt-0.5" />
                                <div>
                                    <p className="font-medium text-neutral-darkest">{formatDate(transaction.created_at)}</p>
                                    <p className="text-sm text-neutral-dark">Tanggal Pemesanan</p>
                                </div>
                            </div>
                            {transaction.paid_at && (
                                <div className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-success mr-3 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-neutral-darkest">{formatDate(transaction.paid_at)}</p>
                                        <p className="text-sm text-neutral-dark">Tanggal Pembayaran</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Total Transaksi */}
                    <div className="bg-white rounded-lg shadow-card p-6">
                        <h2 className="text-lg font-medium text-neutral-darkest mb-4">Total Transaksi</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-neutral-dark">Total Produk</span>
                                <span className="font-medium text-neutral-darkest">{shopItems.length} item</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-dark">Subtotal Produk</span>
                                <span className="font-medium text-neutral-darkest">{formatCurrency(shopTotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-dark">Biaya Pengiriman</span>
                                <span className="font-medium text-neutral-darkest">{formatCurrency(transaction.shipping_cost || 0)}</span>
                            </div>
                            <div className="h-px bg-neutral-light my-2"></div>
                            <div className="flex justify-between">
                                <span className="text-neutral-dark font-medium">Total Keseluruhan</span>
                                <span className="font-bold text-primary-dark text-lg">{formatCurrency(transaction.total_amount)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detail Produk */}
                <div className="mt-6 bg-white rounded-lg shadow-card p-6">
                    <h2 className="text-lg font-medium text-neutral-darkest mb-4">Detail Produk</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-neutral-light">
                            <thead>
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                                        Produk
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-neutral-dark uppercase tracking-wider">
                                        Harga Satuan
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-neutral-dark uppercase tracking-wider">
                                        Jumlah
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-neutral-dark uppercase tracking-wider">
                                        Subtotal
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-light">
                                {shopItems.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center">
                                                <div className="h-12 w-12 flex-shrink-0 rounded-md overflow-hidden bg-neutral-lightest">
                                                    {item.product.image_url ? (
                                                        <img
                                                            src={item.product.image_url}
                                                            alt={item.product.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center bg-neutral-lightest">
                                                            <Package className="h-6 w-6 text-neutral" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-neutral-darkest">
                                                        {item.product.name}
                                                    </div>
                                                    {item.product.sku && (
                                                        <div className="text-xs text-neutral">
                                                            SKU: {item.product.sku}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-center text-neutral-darkest">
                                            {formatCurrency(item.product.price)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-center text-neutral-darkest">
                                            {item.quantity}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right font-medium text-neutral-darkest">
                                            {formatCurrency(item.product.price * item.quantity)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="3" className="px-4 py-3 text-right text-sm font-medium text-neutral-dark">
                                        Subtotal
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm font-medium text-neutral-darkest">
                                        {formatCurrency(shopTotal)}
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="3" className="px-4 py-3 text-right text-sm font-medium text-neutral-dark">
                                        Biaya Pengiriman
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm font-medium text-neutral-darkest">
                                        {formatCurrency(transaction.shipping_cost || 0)}
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="3" className="px-4 py-3 text-right text-sm font-bold text-neutral-darkest">
                                        Total
                                    </td>
                                    <td className="px-4 py-3 text-right text-base font-bold text-primary-dark">
                                        {formatCurrency(transaction.total_amount)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>

            {/* Update Status Modal */}
            {isUpdateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-medium text-neutral-darkest mb-4">
                            Update Status Pesanan
                        </h3>
                        <form onSubmit={handleUpdateStatus}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-neutral-dark mb-1">
                                    Status
                                </label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full rounded-md border border-neutral-light focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                                >
                                    {Object.entries(statuses).map(([key, value]) => (
                                        <option key={key} value={key} disabled={key === 'pending'}>
                                            {value}
                                        </option>
                                    ))}
                                </select>
                                {errors.status && (
                                    <p className="text-xs text-danger mt-1">{errors.status}</p>
                                )}
                            </div>
                            
                            {data.status === 'shipped' && (
                                <>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-neutral-dark mb-1">
                                            Nomor Resi
                                        </label>
                                        <input
                                            type="text"
                                            value={data.tracking_number}
                                            onChange={(e) => setData('tracking_number', e.target.value)}
                                            className="w-full rounded-md border border-neutral-light focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                                            placeholder="Masukkan nomor resi"
                                        />
                                        {errors.tracking_number && (
                                            <p className="text-xs text-danger mt-1">{errors.tracking_number}</p>
                                        )}
                                    </div>
                                    
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-neutral-dark mb-1">
                                            Catatan Pengiriman
                                        </label>
                                        <textarea
                                            value={data.shipping_notes}
                                            onChange={(e) => setData('shipping_notes', e.target.value)}
                                            className="w-full rounded-md border border-neutral-light focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                                            rows="3"
                                            placeholder="Catatan tambahan untuk pengiriman"
                                        ></textarea>
                                        {errors.shipping_notes && (
                                            <p className="text-xs text-danger mt-1">{errors.shipping_notes}</p>
                                        )}
                                    </div>
                                </>
                            )}
                            
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsUpdateModalOpen(false)}
                                    className="px-4 py-2 border border-neutral-light rounded-md text-sm font-medium text-neutral-dark hover:bg-neutral-lightest"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
                                >
                                    {processing ? 'Memproses...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </ShopLayout>
    );
}