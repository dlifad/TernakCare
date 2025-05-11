import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import DashboardStats from '@/Components/Admin/DashboardStats';
import UserApprovalCard from '@/Components/Admin/UserApprovalCard';
import axios from 'axios';

export default function Dashboard() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalDoctors: 0,
    totalShops: 0,
    pendingApprovals: 0
  });
  const [activeTab, setActiveTab] = useState('pending');
  
  // Search functionality
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Data untuk setiap tab
  const [farmers, setFarmers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [shops, setShops] = useState([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  // Error state
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data dari API endpoint
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Gunakan axios dengan header khusus untuk Inertia
        const axiosConfig = {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-Inertia': true
          }
        };
        
        // Alternatif 1: Gunakan endpoint yang dikonfigurasi untuk Inertia
        const statsResponse = await axios.get('/admin/dashboard/stats', axiosConfig);
        setStats(statsResponse.data.props ? statsResponse.data.props.stats : statsResponse.data);
        
        // Alternatif 2: Jika API tetap menggunakan endpoint biasa, tangani responsenya dengan benar
        // const statsResponse = await axios.get('/api/admin/dashboard/stats');
        // setStats(statsResponse.data);
        
        // Fetch pending users (menggunakan URL yang sesuai dengan setup Inertia)
        const pendingResponse = await axios.get('/admin/users/pending', axiosConfig);
        setPendingUsers(pendingResponse.data.props ? pendingResponse.data.props.users : pendingResponse.data);
        
        // Fetch data lainnya sesuai tab yang aktif
        await fetchTabData(activeTab);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Terjadi kesalahan saat mengambil data. Silakan coba lagi nanti.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Fungsi untuk fetch data berdasarkan tab yang aktif
  const fetchTabData = async (tabId) => {
    setIsLoading(true);
    setError(null);
    
    // Konfigurasi untuk permintaan Inertia
    const axiosConfig = {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-Inertia': true
      }
    };
    
    try {
      // Gunakan endpoint sesuai dengan setup Inertia
      const baseUrl = '/admin/users';
      
      if (tabId === 'farmers' && farmers.length === 0) {
        const response = await axios.get(`${baseUrl}/farmers`, axiosConfig);
        setFarmers(response.data.props ? response.data.props.farmers : response.data);
      } else if (tabId === 'doctors' && doctors.length === 0) {
        const response = await axios.get(`${baseUrl}/doctors`, axiosConfig);
        setDoctors(response.data.props ? response.data.props.doctors : response.data);
      } else if (tabId === 'shops' && shops.length === 0) {
        const response = await axios.get(`${baseUrl}/shops`, axiosConfig);
        setShops(response.data.props ? response.data.props.shops : response.data);
      }
    } catch (error) {
      console.error(`Error fetching ${tabId} data:`, error);
      setError(`Terjadi kesalahan saat mengambil data ${tabId}. Silakan coba lagi nanti.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search functionality
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset ke halaman pertama saat pencarian
  };

  // Filter data berdasarkan search term
  const getFilteredData = () => {
    if (!searchTerm) {
      switch (activeTab) {
        case 'pending':
          return pendingUsers;
        case 'farmers':
          return farmers;
        case 'doctors':
          return doctors;
        case 'shops':
          return shops;
        default:
          return [];
      }
    }

    const term = searchTerm.toLowerCase();
    
    switch (activeTab) {
      case 'pending':
        return pendingUsers.filter(user => 
          user.name.toLowerCase().includes(term) || 
          user.email.toLowerCase().includes(term) || 
          user.role.toLowerCase().includes(term)
        );
      case 'farmers':
        return farmers.filter(farmer => 
          farmer.name.toLowerCase().includes(term) || 
          farmer.email.toLowerCase().includes(term) ||
          farmer.status.toLowerCase().includes(term)
        );
      case 'doctors':
        return doctors.filter(doctor => 
          doctor.name.toLowerCase().includes(term) || 
          doctor.email.toLowerCase().includes(term) || 
          doctor.specialty.toLowerCase().includes(term) ||
          doctor.status.toLowerCase().includes(term)
        );
      case 'shops':
        return shops.filter(shop => 
          shop.name.toLowerCase().includes(term) || 
          shop.email.toLowerCase().includes(term) ||
          shop.status.toLowerCase().includes(term)
        );
      default:
        return [];
    }
  };

  // Pagination logic
  const filteredData = getFilteredData();
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1); // Reset ke halaman pertama saat ganti tab
    setSearchTerm(''); // Clear search saat ganti tab
    
    // Fetch data untuk tab yang baru jika belum diambil
    fetchTabData(tabId);
  };
  
  // Fungsi untuk handle approve/suspend user
  const handleUserAction = async (userId, action) => {
    try {
      // Konfigurasi untuk permintaan Inertia
      const axiosConfig = {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-Inertia': true
        }
      };
      
      // Gunakan endpoint yang sesuai dengan setup Inertia
      await axios.post(`/admin/users/${userId}/${action}`, {}, axiosConfig);
      
      // Refresh data setelah aksi berhasil
      if (activeTab === 'pending') {
        const pendingResponse = await axios.get('/admin/users/pending', axiosConfig);
        setPendingUsers(pendingResponse.data.props ? pendingResponse.data.props.users : pendingResponse.data);
      } else if (activeTab === 'farmers') {
        const farmersResponse = await axios.get('/admin/users/farmers', axiosConfig);
        setFarmers(farmersResponse.data.props ? farmersResponse.data.props.farmers : farmersResponse.data);
      } else if (activeTab === 'doctors') {
        const doctorsResponse = await axios.get('/admin/users/doctors', axiosConfig);
        setDoctors(doctorsResponse.data.props ? doctorsResponse.data.props.doctors : doctorsResponse.data);
      } else if (activeTab === 'shops') {
        const shopsResponse = await axios.get('/admin/users/shops', axiosConfig);
        setShops(shopsResponse.data.props ? shopsResponse.data.props.shops : shopsResponse.data);
      }
      
      // Refresh stats
      const statsResponse = await axios.get('/admin/dashboard/stats', axiosConfig);
      setStats(statsResponse.data.props ? statsResponse.data.props.stats : statsResponse.data);
    } catch (error) {
      console.error(`Error performing ${action} on user ${userId}:`, error);
      setError(`Terjadi kesalahan saat melakukan ${action}. Silakan coba lagi nanti.`);
    }
  };

  // Pagination component
  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between border-t border-neutral-light px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
              currentPage === 1 
                ? 'bg-neutral-light text-neutral cursor-not-allowed' 
                : 'bg-white text-primary hover:bg-primary-light/10'
            }`}
          >
            Previous
          </button>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
              currentPage === totalPages 
                ? 'bg-neutral-light text-neutral cursor-not-allowed' 
                : 'bg-white text-primary hover:bg-primary-light/10'
            }`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-neutral-dark">
              Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
              <span className="font-medium">
                {indexOfLastItem > filteredData.length ? filteredData.length : indexOfLastItem}
              </span>{' '}
              of <span className="font-medium">{filteredData.length}</span> results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                  currentPage === 1 
                    ? 'bg-neutral-light text-neutral cursor-not-allowed' 
                    : 'bg-white text-neutral-dark hover:bg-primary-light/10'
                }`}
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Page buttons */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Logic to show pages around current page
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => paginate(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                      currentPage === pageNum
                        ? 'z-10 bg-primary text-white'
                        : 'bg-white text-neutral-dark hover:bg-primary-light/10'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                  currentPage === totalPages 
                    ? 'bg-neutral-light text-neutral cursor-not-allowed' 
                    : 'bg-white text-neutral-dark hover:bg-primary-light/10'
                }`}
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  // Loading indicator
  const LoadingIndicator = () => (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  // Error message
  const ErrorMessage = ({ message }) => (
    <div className="bg-danger/10 text-danger p-4 rounded-lg mb-4">
      <p>{message}</p>
    </div>
  );

  return (
    <AdminLayout>
      <Head title="Admin Dashboard" />
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-heading font-semibold text-neutral-darkest">Admin Dashboard</h1>
          
          {error && <ErrorMessage message={error} />}
          
          <DashboardStats stats={stats} />
          
          <div className="mt-8">
            <div className="flex space-x-1 rounded-lg bg-neutral-light p-1">
              {[
                { id: 'pending', name: 'Pending Approvals' },
                { id: 'farmers', name: 'Farmers' },
                { id: 'doctors', name: 'Doctors' },
                { id: 'shops', name: 'Shops' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 
                    ${
                      activeTab === tab.id
                        ? 'bg-primary text-white shadow'
                        : 'text-neutral-dark hover:bg-primary-light/[0.3]'
                    }`
                  }
                >
                  {tab.name}
                </button>
              ))}
            </div>
            
            {/* Search Bar */}
            <div className="mt-4 mb-4">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-neutral" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full rounded-md border-neutral-light pl-10 py-2 sm:text-sm"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
            
            <div className="mt-4">
              {isLoading ? (
                <LoadingIndicator />
              ) : (
                <>
                  {activeTab === 'pending' && (
                    <div className="rounded-lg bg-white p-3">
                      <div className="space-y-4">
                        {currentItems.length > 0 ? (
                          currentItems.map((user) => (
                            <UserApprovalCard 
                              key={user.id} 
                              user={user} 
                              onApprove={() => handleUserAction(user.id, 'approve')}
                            />
                          ))
                        ) : (
                          <div className="text-center py-8 text-neutral">
                            {searchTerm ? 'Tidak ada hasil yang ditemukan' : 'Tidak ada permintaan persetujuan saat ini'}
                          </div>
                        )}
                      </div>
                      
                      <Pagination />
                    </div>
                  )}
                  
                  {/* Kode untuk tab lainnya tidak berubah */}
                  {activeTab === 'farmers' && (
                    <div className="rounded-lg bg-white p-3">
                      {/* Konten untuk tab Farmers */}
                      {/* ... */}
                      <Pagination />
                    </div>
                  )}
                  
                  {activeTab === 'doctors' && (
                    <div className="rounded-lg bg-white p-3">
                      {/* Konten untuk tab Doctors */}
                      {/* ... */}
                      <Pagination />
                    </div>
                  )}
                  
                  {activeTab === 'shops' && (
                    <div className="rounded-lg bg-white p-3">
                      {/* Konten untuk tab Shops */}
                      {/* ... */}
                      <Pagination />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}