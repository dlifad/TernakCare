import { useState, useEffect } from 'react';
import ShopLayout from '@/Layouts/ShopLayout';
import Card from '@/Components/Shop/Card';
import Table from '@/Components/Shop/Table';
import { Head } from '@inertiajs/react';
import { getTransactionSummary } from '@/Services/transaction';

const Dashboard = ({ auth }) => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    pendingTransactions: 0,
    completedTransactions: 0,
    recentTransactions: [],
    topProducts: [],
    monthlyRevenue: []
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real implementation, this would be fetched from the backend
        const summary = await getTransactionSummary();
        setStats(summary);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { title: 'Total Produk', value: stats.totalProducts, icon: 'package', color: 'bg-primary-light' },
    { title: 'Produk Aktif', value: stats.activeProducts, icon: 'check-circle', color: 'bg-success bg-opacity-20' },
    { title: 'Pesanan Pending', value: stats.pendingTransactions, icon: 'clock', color: 'bg-warning bg-opacity-20' },
    { title: 'Pesanan Selesai', value: stats.completedTransactions, icon: 'check-square', color: 'bg-info bg-opacity-20' },
  ];

  return (
    <ShopLayout user={auth.user}>
      <Head title="Dashboard Toko" />
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-heading font-semibold text-neutral-darkest mb-6">Dashboard Toko</h1>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {statCards.map((stat, index) => (
                  <Card key={index} className={`${stat.color} border-none shadow-card`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-neutral-dark">{stat.title}</h3>
                        <p className="text-2xl font-bold text-neutral-darkest">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-full bg-white bg-opacity-50`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Recent Transactions */}
              <div className="mb-6">
                <Card className="shadow-card">
                  <div className="mb-4 flex justify-between items-center">
                    <h2 className="text-lg font-heading font-semibold text-neutral-darkest">Transaksi Terbaru</h2>
                    <a href="/shop/transactions" className="text-sm text-primary hover:text-primary-dark transition">
                      Lihat Semua
                    </a>
                  </div>
                  
                  {stats.recentTransactions.length > 0 ? (
                    <Table
                      headers={['ID', 'Peternak', 'Produk', 'Total', 'Status', 'Tanggal']}
                      data={stats.recentTransactions.map(tx => [
                        `#${tx.id}`,
                        tx.farmer_name,
                        tx.product_count > 1 ? `${tx.main_product} +${tx.product_count - 1}` : tx.main_product,
                        `Rp ${tx.total.toLocaleString('id-ID')}`,
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          tx.status === 'completed' ? 'bg-success bg-opacity-20 text-success' :
                          tx.status === 'pending' ? 'bg-warning bg-opacity-20 text-warning' :
                          tx.status === 'processing' ? 'bg-info bg-opacity-20 text-info' :
                          'bg-danger bg-opacity-20 text-danger'
                        }`}>
                          {tx.status === 'completed' ? 'Selesai' :
                           tx.status === 'pending' ? 'Menunggu' :
                           tx.status === 'processing' ? 'Diproses' : 'Dibatalkan'}
                        </span>,
                        new Date(tx.created_at).toLocaleDateString('id-ID')
                      ])}
                    />
                  ) : (
                    <div className="text-center py-4 text-neutral">
                      Belum ada transaksi
                    </div>
                  )}
                </Card>
              </div>

              {/* Top Products & Monthly Revenue */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <Card className="shadow-card">
                  <div className="mb-4">
                    <h2 className="text-lg font-heading font-semibold text-neutral-darkest">Produk Terlaris</h2>
                  </div>
                  
                  {stats.topProducts.length > 0 ? (
                    <ul className="space-y-3">
                      {stats.topProducts.map((product, index) => (
                        <li key={index} className="flex items-center justify-between p-3 bg-neutral-lightest rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary-light rounded-md flex items-center justify-center">
                              <span className="text-primary-dark font-bold">{index + 1}</span>
                            </div>
                            <div>
                              <h3 className="font-medium text-neutral-darkest">{product.name}</h3>
                              <p className="text-sm text-neutral">Terjual: {product.sold} unit</p>
                            </div>
                          </div>
                          <div className="font-semibold text-neutral-dark">
                            Rp {product.price.toLocaleString('id-ID')}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-4 text-neutral">
                      Belum ada data produk
                    </div>
                  )}
                </Card>

                {/* Monthly Revenue */}
                <Card className="shadow-card">
                  <div className="mb-4">
                    <h2 className="text-lg font-heading font-semibold text-neutral-darkest">Pendapatan Bulanan</h2>
                  </div>
                  
                  {stats.monthlyRevenue.length > 0 ? (
                    <div className="h-64 flex items-end justify-between">
                      {stats.monthlyRevenue.map((month, index) => {
                        // Simple bar chart calculation
                        const maxRevenue = Math.max(...stats.monthlyRevenue.map(m => m.amount));
                        const height = month.amount / maxRevenue * 100;
                        
                        return (
                          <div key={index} className="flex flex-col items-center">
                            <div 
                              className="w-8 bg-primary rounded-t-md transition-all duration-500"
                              style={{ height: `${height}%` }}
                            />
                            <p className="text-xs text-neutral-dark mt-1">{month.month}</p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-neutral">
                      Belum ada data pendapatan
                    </div>
                  )}
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </ShopLayout>
  );
};

export default Dashboard;