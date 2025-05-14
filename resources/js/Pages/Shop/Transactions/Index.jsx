import React, { useState, useEffect } from "react";
import {
    ShoppingBag,
    ChevronDown,
    ChevronUp,
    Search,
    Filter,
    Calendar
} from "lucide-react";
import ShopLayout from "@/Layouts/ShopLayout";
import { Head, router } from "@inertiajs/react";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function Transactions({ auth, transactions, filters, statuses }) {
    const [activeTab, setActiveTab] = useState(filters?.status || "all");
    const [expandedOrders, setExpandedOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState(filters?.search || "");
    const [startDate, setStartDate] = useState(filters?.start_date || "");
    const [endDate, setEndDate] = useState(filters?.end_date || "");

    useEffect(() => {
        // Update URL when tab changes
        if (activeTab !== (filters?.status || "all")) {
            updateFilters({ status: activeTab === "all" ? null : activeTab });
        }
    }, [activeTab]);

    const updateFilters = (newFilters) => {
        router.get(route('shop.transactions.index'), {
            ...filters,
            ...newFilters
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        updateFilters({ search: searchTerm });
    };

    const handleDateFilter = () => {
        updateFilters({
            start_date: startDate,
            end_date: endDate
        });
    };

    const toggleOrderExpand = (orderId) => {
        if (expandedOrders.includes(orderId)) {
            setExpandedOrders(expandedOrders.filter((id) => id !== orderId));
        } else {
            setExpandedOrders([...expandedOrders, orderId]);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return format(date, 'd MMMM yyyy', { locale: id });
    };

    const getStatusLabel = (status) => {
        return statuses[status] || status;
    };

    return (
        <ShopLayout user={auth.user}>
            <Head title="Transaksi" />
            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold font-heading text-neutral-darkest">
                        Transaksi
                    </h1>
                    <p className="text-neutral-dark">
                        Kelola transaksi penjualan produk Anda
                    </p>
                </div>

                {/* Search and Filter */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    <form onSubmit={handleSearch} className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={18} className="text-neutral" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari nama peternak..."
                            className="block w-full pl-10 pr-3 py-2 border border-neutral-light rounded-lg focus:ring-primary focus:border-primary"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </form>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                className="border border-neutral-light rounded-lg px-3 py-2"
                                placeholder="Tanggal Mulai"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <span>-</span>
                            <input
                                type="date"
                                className="border border-neutral-light rounded-lg px-3 py-2"
                                placeholder="Tanggal Akhir"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                            <button 
                                onClick={handleDateFilter}
                                className="ml-2 flex items-center gap-1 px-3 py-2 bg-white border border-neutral-light rounded-lg text-neutral-dark hover:bg-neutral-lightest"
                            >
                                <Calendar size={16} />
                                <span>Terapkan</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6 border-b border-neutral-light overflow-x-auto">
                    <nav className="flex space-x-6 min-w-max">
                        <button
                            onClick={() => setActiveTab("all")}
                            className={`pb-3 px-1 ${activeTab === "all" ? "border-b-2 border-primary font-medium text-primary" : "text-neutral-dark"}`}
                        >
                            Semua
                        </button>
                        {Object.entries(statuses).map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`pb-3 px-1 ${activeTab === key ? "border-b-2 border-primary font-medium text-primary" : "text-neutral-dark"}`}
                            >
                                {label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Transactions List */}
                <div className="bg-white rounded-lg shadow-card">
                    {transactions.data.length === 0 ? (
                        <div className="p-6 text-center">
                            <ShoppingBag
                                size={48}
                                className="mx-auto text-neutral"
                            />
                            <h3 className="mt-2 text-lg font-medium text-neutral-darkest">
                                Tidak ada transaksi
                            </h3>
                            <p className="mt-1 text-neutral-dark">
                                Belum ada transaksi untuk ditampilkan
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-hidden">
                            <ul className="divide-y divide-neutral-light">
                                {transactions.data.map((transaction) => (
                                    <li
                                        key={transaction.id}
                                        className="px-4 py-4 sm:px-6"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center">
                                                    <p className="font-medium text-neutral-darkest">
                                                        TRX-{String(transaction.id).padStart(3, '0')}
                                                    </p>
                                                    <span
                                                        className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(transaction.status)}`}
                                                    >
                                                        {getStatusLabel(transaction.status)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-neutral-dark">
                                                    {transaction.farmer?.user?.name || 'Peternak'} • {formatDate(transaction.created_at)}
                                                </p>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="text-right mr-4">
                                                    <p className="text-sm font-medium text-neutral-darkest">
                                                        Total:
                                                    </p>
                                                    <p className="text-base font-bold text-primary-dark">
                                                        {formatCurrency(transaction.total_amount)}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        toggleOrderExpand(transaction.id)
                                                    }
                                                    className="p-2 text-neutral-dark hover:text-primary rounded-full hover:bg-neutral-lightest"
                                                >
                                                    {expandedOrders.includes(transaction.id) ? (
                                                        <ChevronUp size={20} />
                                                    ) : (
                                                        <ChevronDown size={20} />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expanded Order Details */}
                                        {expandedOrders.includes(transaction.id) && (
                                            <div className="mt-4 border-t border-neutral-light pt-4">
                                                <h4 className="text-sm font-medium text-neutral-darkest mb-2">
                                                    Detail Pesanan
                                                </h4>
                                                <div className="bg-neutral-lightest rounded-lg p-4">
                                                    <table className="min-w-full divide-y divide-neutral-light">
                                                        <thead>
                                                            <tr>
                                                                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                                                                    Produk
                                                                </th>
                                                                <th className="px-3 py-2 text-center text-xs font-medium text-neutral-dark uppercase tracking-wider">
                                                                    Jumlah
                                                                </th>
                                                                <th className="px-3 py-2 text-right text-xs font-medium text-neutral-dark uppercase tracking-wider">
                                                                    Harga
                                                                </th>
                                                                <th className="px-3 py-2 text-right text-xs font-medium text-neutral-dark uppercase tracking-wider">
                                                                    Subtotal
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-neutral-light">
                                                            {transaction.items.map((item) => (
                                                                <tr key={item.id}>
                                                                    <td className="px-3 py-3 text-sm text-neutral-darkest">
                                                                        {item.product.name}
                                                                    </td>
                                                                    <td className="px-3 py-3 text-sm text-center text-neutral-darkest">
                                                                        {item.quantity}
                                                                    </td>
                                                                    <td className="px-3 py-3 text-sm text-right text-neutral-darkest">
                                                                        {formatCurrency(item.product.price)}
                                                                    </td>
                                                                    <td className="px-3 py-3 text-sm text-right font-medium text-neutral-darkest">
                                                                        {formatCurrency(item.product.price * item.quantity)}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                        <tfoot>
                                                            <tr>
                                                                <td
                                                                    colSpan="3"
                                                                    className="px-3 py-3 text-right text-sm font-medium text-neutral-dark"
                                                                >
                                                                    Total
                                                                </td>
                                                                <td className="px-3 py-3 text-right text-base font-bold text-primary-dark">
                                                                    {formatCurrency(transaction.total_amount)}
                                                                </td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                                <div className="mt-4 flex justify-end space-x-3">
                                                    <a
                                                        href={route('shop.transactions.show', transaction.id)}
                                                        className="inline-flex items-center px-4 py-2 border border-neutral-light rounded-md text-sm font-medium text-neutral-dark hover:bg-neutral-lightest"
                                                    >
                                                        Detail Lengkap
                                                    </a>
                                                    {transaction.status === "pending" && (
                                                        <a
                                                            href={route('shop.transactions.show', transaction.id)}
                                                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
                                                        >
                                                            Konfirmasi Pembayaran
                                                        </a>
                                                    )}
                                                    {transaction.status === "processing" && (
                                                        <a
                                                            href={route('shop.transactions.show', transaction.id)}
                                                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
                                                        >
                                                            Kirim Pesanan
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {/* Pagination */}
                    {transactions.data.length > 0 && (
                        <div className="px-4 py-3 flex items-center justify-between border-t border-neutral-light sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                                {transactions.prev_page_url && (
                                    <a
                                        href={transactions.prev_page_url}
                                        className="relative inline-flex items-center px-4 py-2 border border-neutral-light text-sm font-medium rounded-md text-neutral-dark bg-white hover:bg-neutral-lightest"
                                    >
                                        Sebelumnya
                                    </a>
                                )}
                                {transactions.next_page_url && (
                                    <a
                                        href={transactions.next_page_url}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-neutral-light text-sm font-medium rounded-md text-neutral-dark bg-white hover:bg-neutral-lightest"
                                    >
                                        Berikutnya
                                    </a>
                                )}
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-neutral-dark">
                                        Menampilkan
                                        <span className="font-medium"> {transactions.from} </span>
                                        sampai
                                        <span className="font-medium"> {transactions.to} </span>
                                        dari
                                        <span className="font-medium"> {transactions.total} </span>
                                        hasil
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        {transactions.links.map((link, i) => {
                                            if (link.url === null) return null;
                                            return (
                                                <a
                                                    key={i}
                                                    href={link.url}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium whitespace-nowrap ${
                                                        link.active
                                                            ? 'z-10 bg-primary border-primary text-white'
                                                            : 'bg-white border-neutral-light text-neutral-dark hover:bg-neutral-lightest'
                                                    } ${i === 0 ? 'rounded-l-md' : ''} ${
                                                        i === transactions.links.length - 1 ? 'rounded-r-md' : ''
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        })}
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ShopLayout>
    );
}