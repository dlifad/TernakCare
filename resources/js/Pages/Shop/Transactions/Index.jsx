import React, { useState } from 'react';
import { ShoppingBag, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';
import ShopLayout from '@/Layouts/ShopLayout';
import { Head } from '@inertiajs/react';

export default function Transactions({ auth }) {
  const [activeTab, setActiveTab] = useState('all');
  const [expandedOrders, setExpandedOrders] = useState([]);
  
  // Sample data for demonstration
  const transactions = [
    {
      id: 'TRX-001',
      customer: 'Ahmad Fajar',
      date: '10 May 2025',
      total: 750000,
      status: 'pending',
      items: [
        { name: 'Pakan Ternak Premium', quantity: 2, price: 250000 },
        { name: 'Vitamin Ternak', quantity: 1, price: 250000 },
      ]
    },
    {
      id: 'TRX-002',
      customer: 'Budi Santoso',
      date: '9 May 2025',
      total: 450000,
      status: 'processing',
      items: [
        { name: 'Obat Ternak', quantity: 3, price: 150000 },
      ]
    },
    {
      id: 'TRX-003',
      customer: 'Citra Dewi',
      date: '8 May 2025',
      total: 1250000,
      status: 'shipped',
      items: [
        { name: 'Pakan Ternak Regular', quantity: 5, price: 150000 },
        { name: 'Alat Perah Susu', quantity: 1, price: 500000 },
      ]
    }
  ];

  const toggleOrderExpand = (orderId) => {
    if (expandedOrders.includes(orderId)) {
      setExpandedOrders(expandedOrders.filter(id => id !== orderId));
    } else {
      setExpandedOrders([...expandedOrders, orderId]);
    }
  };

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
      case 'pending':
        return 'bg-warning/20 text-warning';
      case 'processing':
        return 'bg-info/20 text-info';
      case 'shipped':
        return 'bg-success/20 text-success';
      case 'delivered':
        return 'bg-primary/20 text-primary-dark';
      case 'cancelled':
        return 'bg-danger/20 text-danger';
      default:
        return 'bg-neutral-light text-neutral-dark';
    }
  };
  
  return (
    <ShopLayout user={auth.user}>
      <Head title="Transaksi" />
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-heading text-neutral-darkest">Transaksi</h1>
          <p className="text-neutral-dark">Kelola transaksi penjualan produk Anda</p>
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
              <select className="appearance-none bg-white border border-neutral-light rounded-lg px-4 py-2 pr-8 focus:ring-primary focus:border-primary text-neutral-dark">
                <option>Semua Tanggal</option>
                <option>Hari Ini</option>
                <option>Minggu Ini</option>
                <option>Bulan Ini</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-dark">
                <ChevronDown size={16} />
              </div>
            </div>
            <button className="flex items-center gap-1 px-4 py-2 bg-white border border-neutral-light rounded-lg text-neutral-dark hover:bg-neutral-lightest">
              <Filter size={18} />
              <span>Filter</span>
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
              onClick={() => setActiveTab('pending')}
              className={`pb-3 px-1 ${activeTab === 'pending' ? 'border-b-2 border-primary font-medium text-primary' : 'text-neutral-dark'}`}
            >
              Menunggu Pembayaran
            </button>
            <button
              onClick={() => setActiveTab('processing')}
              className={`pb-3 px-1 ${activeTab === 'processing' ? 'border-b-2 border-primary font-medium text-primary' : 'text-neutral-dark'}`}
            >
              Diproses
            </button>
            <button
              onClick={() => setActiveTab('shipped')}
              className={`pb-3 px-1 ${activeTab === 'shipped' ? 'border-b-2 border-primary font-medium text-primary' : 'text-neutral-dark'}`}
            >
              Dikirim
            </button>
          </nav>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-lg shadow-card">
          {filteredTransactions.length === 0 ? (
            <div className="p-6 text-center">
              <ShoppingBag size={48} className="mx-auto text-neutral" />
              <h3 className="mt-2 text-lg font-medium text-neutral-darkest">Tidak ada transaksi</h3>
              <p className="mt-1 text-neutral-dark">Belum ada transaksi untuk ditampilkan</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <ul className="divide-y divide-neutral-light">
                {filteredTransactions.map((transaction) => (
                  <li key={transaction.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center">
                          <p className="font-medium text-neutral-darkest">{transaction.id}</p>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(transaction.status)}`}>
                            {transaction.status === 'pending' && 'Menunggu Pembayaran'}
                            {transaction.status === 'processing' && 'Diproses'}
                            {transaction.status === 'shipped' && 'Dikirim'}
                            {transaction.status === 'delivered' && 'Selesai'}
                            {transaction.status === 'cancelled' && 'Dibatalkan'}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-dark">
                          {transaction.customer} • {transaction.date}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <div className="text-right mr-4">
                          <p className="text-sm font-medium text-neutral-darkest">Total:</p>
                          <p className="text-base font-bold text-primary-dark">{formatCurrency(transaction.total)}</p>
                        </div>
                        <button
                          onClick={() => toggleOrderExpand(transaction.id)}
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
                        <h4 className="text-sm font-medium text-neutral-darkest mb-2">Detail Pesanan</h4>
                        <div className="bg-neutral-lightest rounded-lg p-4">
                          <table className="min-w-full divide-y divide-neutral-light">
                            <thead>
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Produk</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-neutral-dark uppercase tracking-wider">Jumlah</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-neutral-dark uppercase tracking-wider">Harga</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-neutral-dark uppercase tracking-wider">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-light">
                              {transaction.items.map((item, idx) => (
                                <tr key={idx}>
                                  <td className="px-3 py-3 text-sm text-neutral-darkest">{item.name}</td>
                                  <td className="px-3 py-3 text-sm text-center text-neutral-darkest">{item.quantity}</td>
                                  <td className="px-3 py-3 text-sm text-right text-neutral-darkest">{formatCurrency(item.price)}</td>
                                  <td className="px-3 py-3 text-sm text-right font-medium text-neutral-darkest">{formatCurrency(item.price * item.quantity)}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr>
                                <td colSpan="3" className="px-3 py-3 text-right text-sm font-medium text-neutral-dark">Total</td>
                                <td className="px-3 py-3 text-right text-base font-bold text-primary-dark">{formatCurrency(transaction.total)}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                        <div className="mt-4 flex justify-end space-x-3">
                          <button className="inline-flex items-center px-4 py-2 border border-neutral-light rounded-md text-sm font-medium text-neutral-dark hover:bg-neutral-lightest">
                            Detail Lengkap
                          </button>
                          {transaction.status === 'pending' && (
                            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark">
                              Konfirmasi Pembayaran
                            </button>
                          )}
                          {transaction.status === 'processing' && (
                            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark">
                              Kirim Pesanan
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </ShopLayout>
  );
}