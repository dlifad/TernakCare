import React, { useState, useEffect } from "react";
import {
    ClipboardList,
    Calendar,
    Download,
    Search,
    ChevronDown,
    Eye,
} from "lucide-react";
import ShopLayout from "@/Layouts/ShopLayout";
import { Head, Link, router } from "@inertiajs/react";
import { format } from '@/Components/Common/format';


export default function History({ auth, transactions, filters, statistics }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || "");
    const [activeTab, setActiveTab] = useState(filters.status || "all");
    const [startDate, setStartDate] = useState(filters.start_date || "");
    const [endDate, setEndDate] = useState(filters.end_date || "");
    const [didMount, setDidMount] = useState(false);


    useEffect(() => {

        if (!didMount) {
            setDidMount(true);
            return;
        }

        if (searchQuery !== (filters.search || "")) {
            const debounce = setTimeout(() => {
                applyFilters();
            }, 500);

            return () => clearTimeout(debounce);
        }
    }, [searchQuery]);


    // Format currency to IDR
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Change active tab and filter transactions
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        applyFilters(tab);
    };

    // Apply filters and redirect to the same page with the filters in the query string
    const applyFilters = (status = activeTab) => {
        router.get(
            route("shop.history"),
            {
                search: searchQuery,
                status: status === "all" ? "" : status,
                start_date: startDate,
                end_date: endDate,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    // Handle date filter submissions
    const handleDateFilterSubmit = () => {
        applyFilters();
    };

    // Export report
    const handleExport = () => {
        if (!startDate || !endDate) {
            alert("Harap pilih tanggal mulai dan selesai untuk ekspor laporan");
            return;
        }
        
        // Redirect to export URL with the date range as query parameters
        window.location.href = route("shop.history.export") + 
            "?start_date=" + startDate + "&end_date=" + endDate;
    };

    // Get status badge class based on the status
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case "delivered":
                return "bg-success/20 text-success";
            case "cancelled":
                return "bg-danger/20 text-danger";
            default:
                return "bg-neutral-light text-neutral-dark";
        }
    };

    // Get status text based on the status
    const getStatusText = (status) => {
        switch (status) {
            case "delivered":
                return "Selesai";
            case "cancelled":
                return "Dibatalkan";
            default:
                return status;
        }
    };

    return (
        <ShopLayout user={auth.user}>
            <Head title="Riwayat" />
            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold font-heading text-neutral-darkest">
                        Riwayat Transaksi
                    </h1>
                    <p className="text-neutral-dark">
                        Lihat dan analisis riwayat transaksi toko Anda
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-card">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-neutral-dark">
                                Total Penjualan
                            </h3>
                            <span className="p-2 bg-primary-light rounded-full">
                                <ClipboardList
                                    size={16}
                                    className="text-primary-dark"
                                />
                            </span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-neutral-darkest">
                            {formatCurrency(statistics.totalSales)}
                        </p>
                        <p className="text-xs text-neutral">Transaksi selesai</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-card">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-neutral-dark">
                                Jumlah Transaksi
                            </h3>
                            <span className="p-2 bg-secondary-light rounded-full">
                                <ClipboardList
                                    size={16}
                                    className="text-secondary-dark"
                                />
                            </span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-neutral-darkest">
                            {statistics.totalTransactions}
                        </p>
                        <p className="text-xs text-neutral">Transaksi selesai</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-card">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-neutral-dark">
                                Rata-rata Order
                            </h3>
                            <span className="p-2 bg-accent-light rounded-full">
                                <ClipboardList
                                    size={16}
                                    className="text-accent-dark"
                                />
                            </span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-neutral-darkest">
                            {formatCurrency(statistics.averageOrder)}
                        </p>
                        <p className="text-xs text-neutral">per transaksi</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-card">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-neutral-dark">
                                Pesanan Dibatalkan
                            </h3>
                            <span className="p-2 bg-danger/20 rounded-full">
                                <ClipboardList
                                    size={16}
                                    className="text-danger"
                                />
                            </span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-neutral-darkest">
                            {statistics.cancelledOrders}
                        </p>
                        <p className="text-xs text-neutral">Total dibatalkan</p>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={18} className="text-neutral" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari transaksi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-neutral-light rounded-lg focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-4 py-2 border border-neutral-light rounded-lg"
                            placeholder="Tanggal Mulai"
                        />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-4 py-2 border border-neutral-light rounded-lg"
                            placeholder="Tanggal Selesai"
                        />
                        <button 
                            onClick={handleDateFilterSubmit}
                            className="flex items-center gap-1 px-4 py-2 bg-white border border-neutral-light rounded-lg text-neutral-dark hover:bg-neutral-lightest"
                        >
                            <Calendar size={18} />
                            <span>Terapkan</span>
                        </button>
                        <button 
                            onClick={handleExport}
                            className="flex items-center gap-1 px-4 py-2 bg-white border border-neutral-light rounded-lg text-neutral-dark hover:bg-neutral-lightest"
                        >
                            <Download size={18} />
                            <span>Ekspor</span>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6 border-b border-neutral-light">
                    <nav className="flex space-x-6">
                        <button
                            onClick={() => handleTabChange("all")}
                            className={`pb-3 px-1 ${activeTab === "all" ? "border-b-2 border-primary font-medium text-primary" : "text-neutral-dark"}`}
                        >
                            Semua
                        </button>
                        <button
                            onClick={() => handleTabChange("delivered")}
                            className={`pb-3 px-1 ${activeTab === "delivered" ? "border-b-2 border-primary font-medium text-primary" : "text-neutral-dark"}`}
                        >
                            Selesai
                        </button>
                        <button
                            onClick={() => handleTabChange("cancelled")}
                            className={`pb-3 px-1 ${activeTab === "cancelled" ? "border-b-2 border-primary font-medium text-primary" : "text-neutral-dark"}`}
                        >
                            Dibatalkan
                        </button>
                    </nav>
                </div>

                {/* Transactions Table */}
                <div className="bg-white rounded-lg shadow-card overflow-hidden">
                    <table className="min-w-full divide-y divide-neutral-light">
                        <thead className="bg-neutral-lightest">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider"
                                >
                                    ID Transaksi
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider"
                                >
                                    Pelanggan
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider"
                                >
                                    Tanggal
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider"
                                >
                                    Status
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-right text-xs font-medium text-neutral-dark uppercase tracking-wider"
                                >
                                    Total
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-right text-xs font-medium text-neutral-dark uppercase tracking-wider"
                                >
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-neutral-light">
                            {transactions.data.length > 0 ? (
                                transactions.data.map((transaction) => (
                                    <tr
                                        key={transaction.id}
                                        className="hover:bg-neutral-lightest"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-darkest">
                                            {transaction.transaction_code}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">
                                            {transaction.farmer.user.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">
                                            {format.formatDate(transaction.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(transaction.status)}`}
                                            >
                                                {getStatusText(transaction.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-neutral-darkest">
                                            {formatCurrency(transaction.total_amount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link
                                                href={route('shop.history.show', transaction.id)}
                                                className="text-primary hover:text-primary-dark"
                                            >
                                                <span>Detail</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-6 py-4 text-center text-neutral-dark"
                                    >
                                        Tidak ada transaksi yang ditemukan
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {transactions.data.length > 0 && (
                        <div className="px-6 py-3 flex items-center justify-between border-t border-neutral-light">
                            <div className="text-sm text-neutral-dark">
                                Menampilkan {transactions.from}-{transactions.to} dari{" "}
                                {transactions.total} hasil
                            </div>
                            <div className="flex gap-2">
                                {transactions.links.map((link, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            if (link.url) {
                                                window.location.href = link.url;
                                            }
                                        }}
                                        className={`px-3 py-1 ${
                                            link.active
                                                ? "bg-primary text-white"
                                                : "border border-neutral-light text-neutral-dark"
                                        } rounded ${
                                            !link.url ? "opacity-50 cursor-not-allowed" : ""
                                        }`}
                                        disabled={!link.url}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ShopLayout>
    );
}