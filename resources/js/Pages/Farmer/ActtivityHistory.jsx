import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import FarmerLayout from '@/Layouts/FarmerLayout';
import Table from '@/Components/Common/Table';
import Pagination from '@/Components/Common/Pagination';
import ActivityHistory from '@/Components/Farmer/ActivityHistory';

const ActivityHistoryPage = ({ auth }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'Semua Aktivitas' },
    { id: 'consultation', label: 'Konsultasi Dokter' },
    { id: 'purchase', label: 'Pembelian Produk' },
  ];

  useEffect(() => {
    loadActivities();
  }, [currentPage, activeTab]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      // Replace with your actual API call
      const response = await fetch(`/api/farmer/activities?page=${currentPage}&type=${activeTab}`);
      const data = await response.json();
      
      setActivities(data.data);
      setTotalPages(data.meta.last_page);
      setLoading(false);
    } catch (error) {
      console.error('Error loading activities:', error);
      setLoading(false);
      // For demo purposes, use sample data
      const sampleData = generateSampleData(activeTab);
      setActivities(sampleData);
      setTotalPages(3);
    }
  };
  
  // Generate sample data for demo purposes
  const generateSampleData = (type) => {
    const baseData = [
      {
        id: 1,
        type: 'consultation',
        title: 'Konsultasi dengan Dr. Andi',
        description: 'Konsultasi kesehatan sapi perah via video call',
        status: 'completed',
        created_at: '2025-05-05T14:30:00',
        link: '/farmer/consultation/1'
      },
      {
        id: 2,
        type: 'purchase',
        title: 'Pembelian Pakan Ternak',
        description: 'Pembelian pakan ternak premium 50kg',
        status: 'pending',
        created_at: '2025-05-04T10:15:00',
        link: '/farmer/transaction/2'
      },
      {
        id: 3,
        type: 'consultation',
        title: 'Kunjungan Dokter Hewan',
        description: 'Kunjungan Dr. Budi untuk vaksinasi rutin',
        status: 'approved',
        created_at: '2025-05-03T09:00:00',
        link: '/farmer/consultation/3'
      },
      {
        id: 4,
        type: 'purchase',
        title: 'Pembelian Obat',
        description: 'Pembelian vitamin dan suplemen ternak',
        status: 'completed',
        created_at: '2025-05-02T16:45:00',
        link: '/farmer/transaction/4'
      },
      {
        id: 5,
        type: 'consultation',
        title: 'Chat dengan Dr. Citra',
        description: 'Konsultasi masalah kesehatan kambing via chat',
        status: 'ongoing',
        created_at: '2025-05-01T13:20:00',
        link: '/farmer/consultation/5'
      }
    ];
    
    if (type === 'all') {
      return baseData;
    }
    
    return baseData.filter(item => item.type === type);
  };

  // Helper function to generate activity status badge
  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-warning text-white',
      completed: 'bg-success text-white',
      ongoing: 'bg-info text-white',
      cancelled: 'bg-danger text-white',
      approved: 'bg-success text-white',
      rejected: 'bg-danger text-white'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status.toLowerCase()] || 'bg-neutral-light text-neutral-dark'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
}