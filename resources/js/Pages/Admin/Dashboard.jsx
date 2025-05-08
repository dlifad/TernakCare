import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import DashboardStats from '@/Components/Admin/DashboardStats';
import UserApprovalCard from '@/Components/Admin/UserApprovalCard';

export default function Dashboard() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalDoctors: 0,
    totalShops: 0,
    pendingApprovals: 0
  });
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    // Fetch pending users and stats from API
    // This would be replaced with actual API calls
    setPendingUsers([
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'farmer', createdAt: '2025-05-01' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'doctor', createdAt: '2025-05-02' },
      { id: 3, name: 'Farm Supply Store', email: 'store@example.com', role: 'shop', createdAt: '2025-05-03' },
    ]);

    setStats({
      totalFarmers: 145,
      totalDoctors: 32,
      totalShops: 18,
      pendingApprovals: 3
    });
  }, []);

  return (
    <AdminLayout>
      <Head title="Admin Dashboard" />
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-heading font-semibold text-neutral-darkest">Admin Dashboard</h1>
          
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
                  onClick={() => setActiveTab(tab.id)}
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
            
            <div className="mt-4">
              {activeTab === 'pending' && (
                <div className="rounded-lg bg-white p-3">
                  <div className="space-y-4">
                    {pendingUsers.map((user) => (
                      <UserApprovalCard key={user.id} user={user} />
                    ))}
                    
                    {pendingUsers.length === 0 && (
                      <div className="text-center py-8 text-neutral">
                        No pending approvals at this time
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {activeTab === 'farmers' && (
                <div className="rounded-lg bg-white p-3">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-light">
                      <thead className="bg-neutral-lightest">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Name</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Email</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Joined</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-neutral-light">
                        {/* Sample farmer data */}
                        {[1, 2, 3].map((item) => (
                          <tr key={item}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-darkest">Farmer Name {item}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">farmer{item}@example.com</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">April {item+10}, 2025</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-success bg-opacity-10 text-success">
                                Active
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">
                              <button className="text-primary hover:text-primary-dark mr-2">View</button>
                              <button className="text-danger hover:text-red-700">Suspend</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {activeTab === 'doctors' && (
                <div className="rounded-lg bg-white p-3">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-light">
                      <thead className="bg-neutral-lightest">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Name</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Email</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Specialty</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-neutral-light">
                        {/* Sample doctor data */}
                        {[1, 2, 3].map((item) => (
                          <tr key={item}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-darkest">Dr. Smith {item}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">doctor{item}@example.com</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">Veterinary</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-success bg-opacity-10 text-success">
                                Active
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">
                              <button className="text-primary hover:text-primary-dark mr-2">View</button>
                              <button className="text-danger hover:text-red-700">Suspend</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {activeTab === 'shops' && (
                <div className="rounded-lg bg-white p-3">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-light">
                      <thead className="bg-neutral-lightest">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Shop Name</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Email</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Products</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-neutral-light">
                        {/* Sample shop data */}
                        {[1, 2, 3].map((item) => (
                          <tr key={item}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-darkest">Farm Supply {item}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">shop{item}@example.com</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">{item * 5}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-success bg-opacity-10 text-success">
                                Active
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">
                              <button className="text-primary hover:text-primary-dark mr-2">View</button>
                              <button className="text-danger hover:text-red-700">Suspend</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}