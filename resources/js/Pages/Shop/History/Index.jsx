import React, { useState } from 'react';
import { ClipboardList, Calendar, Download, Search, Filter, ChevronDown, Eye } from 'lucide-react';
import ShopLayout from '@/Layouts/ShopLayout';
import { Head } from '@inertiajs/react';

export default function History({ auth }) {
  const [activeTab, setActiveTab] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  
  // Sample data for demonstration
  const transactions = [
    {
      id: 'TRX-001',
      customer: 'Ahmad Fajar',
      date: '10 Apr 2025',
      total: 750000,
      status: 'completed',
      payment_method: 'Bank Transfer'
    },
    {
      id: 'TRX-002',
      customer: 'Budi Santoso',
      date: '5 Apr 2025',
      total: 450000,
      status: 'completed',
      payment_method: 'E-Wallet'
    },
    {
      id: 'TRX-003',
      customer: 'Citra Dewi',
      date: '2 Apr 2025',
      total: 1250000,
      status: 'completed',
      payment_method: 'Bank Transfer'
    },
    {
      id: 'TRX-004',
      customer: 'Deni Mahardika',
      date: '25 Mar 2025',
      total: 320000,
      status: 'cancelled',
      payment_method: 'COD'
    },
    {
      id: 'TRX-005',
      customer: 'Eka Putri',
      date: '20 Mar 2025',
      total: 890000,
      status: 'completed',
      payment_method: 'E-Wallet'
    }
  ];

  const filteredTransactions = activeTab === 'all' 
    ? transactions 
    : transactions.filter(tx => tx.status === activeTab);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'completed':
        return 'bg-success/20 text-success';
      case 'cancelled':
        return 'bg-danger/20 text-danger';
      default:
        return 'bg-neutral-light text-neutral-dark';
    }
  };

  // Summary metrics
  const totalSales = transactions.filter(tx => tx.status === 'completed').reduce((sum, tx) => sum + tx.total, 0);
  const totalTransactions = transactions.filter(tx => tx.status === 'completed').length;
  const averageOrder = totalTransactions > 0 ? totalSales / totalTransactions : 0;
  const cancelledOrders = transactions.filter(tx => tx.status === 'cancelled').length;
  
  return (
    <ShopLayout user={auth.user}>
      <Head title="Riwayat" />
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-heading text-neutral-darkest">Riwayat Transaksi</h1>
          <p className="text-neutral-dark">Lihat dan analisis riwayat transaksi toko Anda</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-card">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-neutral-dark">Total Penjualan</h3>
              <span className="p-2 bg-primary-light rounded-full">
                <ClipboardList size={16} className="text-primary-dark" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-neutral-darkest">{formatCurrency(totalSales)}</p>
            <p className="text-xs text-neutral">30 hari terakhir</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-card">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-neutral-dark">Jumlah Transaksi</h3>
              <span className="p-2 bg-secondary-light rounded-full">
                <ClipboardList size={16} className="text-secondary-dark" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-neutral-darkest">{totalTransactions}</p>
            <p className="text-xs text-neutral">30 hari terakhir</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-card">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-neutral-dark">Rata-rata Order</h3>
              <span className="p-2 bg-accent-light rounded-full">
                <ClipboardList size={16} className="text-accent-dark" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-neutral-darkest">{formatCurrency(averageOrder)}</p>
            <p className="text-xs text-neutral">per transaksi</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-card">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-neutral-dark">Pesanan Dibatalkan</h3>
              <span className="p-2 bg-danger/20 rounded-full">
                <ClipboardList size={16} className="text-danger" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-neutral-darkest">{cancelledOrders}</p>
            <p className="text-xs text-neutral">30 hari terakhir</p>
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
              className="block w-full pl-10 pr-3 py-2 border border-neutral-light rounded-lg focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <select 
                className="appearance-none bg-white border border-neutral-light rounded-lg px-4 py-2 pr-8 focus:ring-primary focus:border-primary text-neutral-dark"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="all">Semua Tanggal</option>
                <option value="today">Hari Ini</option>
                <option value="week">Minggu Ini</option>
                <option value="month">Bulan Ini</option>
                <option value="custom">Kustom</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-dark">
                <ChevronDown size={16} />
              </div>
            </div>
            <button className="flex items-center gap-1 px-4 py-2 bg-white border border-neutral-light rounded-lg text-neutral-dark hover:bg-neutral-lightest">
              <Calendar size={18} />
              <span>Tanggal</span>
            </button>
            <button className="flex items-center gap-1 px-4 py-2 bg-white border border-neutral-light rounded-lg text-neutral-dark hover:bg-neutral-lightest">
              <Download size={18} />
              <span>Ekspor</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-neutral-light">
          <nav className="flex space-x-6">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-3 px-1 ${activeTab === 'all' ? 'border-b-2 border-primary font-medium text-primary' : 'text-neutral-dark'}`}
            >
              Semua
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`pb-3 px-1 ${activeTab === 'completed' ? 'border-b-2 border-primary font-medium text-primary' : 'text-neutral-dark'}`}
            >
              Selesai
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`pb-3 px-1 ${activeTab === 'cancelled' ? 'border-b-2 border-primary font-medium text-primary' : 'text-neutral-dark'}`}
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                  ID Transaksi
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                  Pelanggan
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                  Tanggal
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                  Metode Pembayaran
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-dark uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-dark uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-light">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-neutral-lightest">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-darkest">
                    {transaction.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">
                    {transaction.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">
                    {transaction.payment_method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(transaction.status)}`}>
                      {transaction.status === 'completed' && 'Selesai'}
                      {transaction.status === 'cancelled' && 'Dibatalkan'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-neutral-darkest">
                    {formatCurrency(transaction.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary hover:text-primary-dark">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          <div className="px-6 py-3 flex items-center justify-between border-t border-neutral-light">
            <div className="text-sm text-neutral-dark">
              Menampilkan 1-{filteredTransactions.length} dari {filteredTransactions.length} hasil
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-neutral-light rounded text-neutral-dark disabled:opacity-50" disabled>
                Sebelumnya
              </button>
              <button className="px-3 py-1 bg-primary text-white rounded">
                1
              </button>
              <button className="px-3 py-1 border border-neutral-light rounded text-neutral-dark disabled:opacity-50" disabled>
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}