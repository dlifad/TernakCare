import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import DoctorLayout from '@/Layouts/DoctorLayout';
import { Search, Calendar, Clock, MessageCircle, Filter, ChevronDown, UserCircle, Video, MapPin, Star, Download } from 'lucide-react';

export default function DoctorHistory({ history = [] }) {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  
  // Mock data for consultation history
  const mockHistory = [
    {
      id: 1,
      patient_name: 'Dewi Lestari',
      date: '8 Mei 2025',
      time: '10:00 - 11:00',
      animal_type: 'Ayam',
      consultation_type: 'visit',
      complaint: 'Beberapa ayam mengalami gejala flu dan produksi telur menurun',
      diagnosis: 'Infeksi saluran pernapasan (CRD - Chronic Respiratory Disease)',
      prescription: 'Antibiotik Enrofloxacin 10mg/kg selama 5 hari, tambahan vitamin dan probiotik',
      notes: 'Peternak diminta untuk memisahkan ayam yang sakit dan menjaga kebersihan kandang',
      rating: 5,
    },
    {
      id: 2,
      patient_name: 'Joko Widodo',
      date: '5 Mei 2025',
      time: '13:30 - 14:15',
      animal_type: 'Sapi',
      consultation_type: 'video',
      complaint: 'Sapi mengalami pembengkakan pada kaki dan kesulitan berjalan',
      diagnosis: 'Laminitis dan kemungkinan infeksi kuku',
      prescription: 'Anti-inflamasi Flunixin 2.2mg/kg, antibiotik Ceftiofur 1mg/kg selama 3 hari',
      notes: 'Rekomendasi untuk pemeriksaan lanjutan dan perawatan kuku oleh dokter hewan',
      rating: 4,
    },
    {
      id: 3,
      patient_name: 'Siti Aminah',
      date: '1 Mei 2025',
      time: '09:00 - 09:30',
      animal_type: 'Kambing',
      consultation_type: 'chat',
      complaint: 'Kambing kehilangan nafsu makan dan tampak lesu',
      diagnosis: 'Parasit internal - infestasi cacing',
      prescription: 'Obat cacing Albendazole 10mg/kg dosis tunggal, suplemen elektrolit',
      notes: 'Penyesuaian pakan dan penambahan mineral untuk mempercepat pemulihan',
      rating: 5,
    },
    {
      id: 4,
      patient_name: 'Ahmad Farhan',
      date: '25 April 2025',
      time: '14:00 - 14:45',
      animal_type: 'Sapi',
      consultation_type: 'visit',
      complaint: 'Sapi betina kesulitan melahirkan',
      diagnosis: 'Dystocia - komplikasi kelahiran',
      prescription: 'Prosedur bantuan kelahiran dilakukan, antibiotik Penicillin 22,000 IU/kg selama 5 hari',
      notes: 'Induk dan anak sapi dalam kondisi stabil setelah penanganan, pemantauan lanjutan diperlukan',
      rating: 5,
    },
  ];
  
  const allHistory = history.length > 0 ? history : mockHistory;
  
  // Filter history based on various criteria
  const filteredHistory = allHistory.filter(record => {
    const matchesTypeFilter = filter === 'all' || record.consultation_type === filter;
    const matchesDateFilter = dateFilter === 'all' || filterByDate(record.date, dateFilter);
    const matchesSearch = record.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          record.animal_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          record.complaint.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          record.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTypeFilter && matchesDateFilter && matchesSearch;
  });
  
  // Helper function to filter by date ranges
  function filterByDate(dateStr, filter) {
    const today = new Date();
    const recordDate = new Date(dateStr.split(' ').join(' '));
    
    switch(filter) {
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        return recordDate >= weekAgo;
      case 'month':
        const monthAgo = new Date();
        monthAgo.setMonth(today.getMonth() - 1);
        return recordDate >= monthAgo;
      case 'year':
        const yearAgo = new Date();
        yearAgo.setFullYear(today.getFullYear() - 1);
        return recordDate >= yearAgo;
      default:
        return true;
    }
  }
  
  const consultationTypeIcon = (type) => {
    switch(type) {
      case 'chat':
        return <MessageCircle size={16} className="mr-1" />;
      case 'video':
        return <Video size={16} className="mr-1" />;
      case 'visit':
        return <MapPin size={16} className="mr-1" />;
      default:
        return <MessageCircle size={16} className="mr-1" />;
    }
  };

  const consultationTypeLabel = (type) => {
    switch(type) {
      case 'chat':
        return 'Chat';
      case 'video':
        return 'Video Call';
      case 'visit':
        return 'Kunjungan';
      default:
        return 'Chat';
    }
  };

  const consultationTypeClass = (type) => {
    switch(type) {
      case 'chat':
        return 'bg-blue-50 text-blue-700';
      case 'video':
        return 'bg-purple-50 text-purple-700';
      case 'visit':
        return 'bg-teal-50 text-teal-700';
      default:
        return 'bg-blue-50 text-blue-700';
    }
  };
  
  const renderStarRating = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={16} 
            className={i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} 
          />
        ))}
      </div>
    );
  };
  
  return (
    <DoctorLayout>
      <Head title="Riwayat Konsultasi" />
      
      <div className="py-6 px-4 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-neutral-darkest">Riwayat Konsultasi</h1>
          <p className="text-neutral-dark mt-1">Lihat catatan konsultasi yang telah selesai</p>
        </div>
        
        <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-neutral" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-neutral-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Cari nama pasien, jenis hewan, keluhan, atau diagnosis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative inline-block text-left">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-neutral-light rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">Semua Waktu</option>
                <option value="week">Minggu Ini</option>
                <option value="month">Bulan Ini</option>
                <option value="year">Tahun Ini</option>
              </select>
            </div>
            
            <div className="flex space-x-2">
              <button
                className={`px-3 py-1 text-sm rounded-md transition-colors ${filter === 'all' ? 'bg-primary text-white' : 'bg-white border border-neutral-light text-neutral-dark hover:bg-neutral-lightest'}`}
                onClick={() => setFilter('all')}
              >
                Semua
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-md transition-colors ${filter === 'chat' ? 'bg-primary text-white' : 'bg-white border border-neutral-light text-neutral-dark hover:bg-neutral-lightest'}`}
                onClick={() => setFilter('chat')}
              >
                Chat
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-md transition-colors ${filter === 'video' ? 'bg-primary text-white' : 'bg-white border border-neutral-light text-neutral-dark hover:bg-neutral-lightest'}`}
                onClick={() => setFilter('video')}
              >
                Video
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-md transition-colors ${filter === 'visit' ? 'bg-primary text-white' : 'bg-white border border-neutral-light text-neutral-dark hover:bg-neutral-lightest'}`}
                onClick={() => setFilter('visit')}
              >
                Kunjungan
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-card overflow-hidden">
          <div className="divide-y divide-neutral-light">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((record) => (
                <div key={record.id} className="p-4 hover:bg-neutral-lightest transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <UserCircle size={48} className="text-neutral" />
                      </div>
                      <div>
                        <h3 className="font-medium text-neutral-darkest">{record.patient_name}</h3>
                        <p className="text-sm text-neutral-dark">{record.animal_type}</p>
                        <div className="mt-1 flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${consultationTypeClass(record.consultation_type)}`}>
                            {consultationTypeIcon(record.consultation_type)}
                            {consultationTypeLabel(record.consultation_type)}
                          </span>
                          <div className="text-yellow-500 flex items-center">
                            {renderStarRating(record.rating)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 lg:mt-0 flex flex-col lg:items-end space-y-2">
                      <div className="flex items-center text-sm text-neutral-dark">
                        <Calendar size={16} className="mr-1" />
                        {record.date}
                      </div>
                      <div className="flex items-center text-sm text-neutral-dark">
                        <Clock size={16} className="mr-1" />
                        {record.time}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-neutral-darkest">Keluhan:</h4>
                      <p className="text-sm text-neutral-dark mt-1">{record.complaint}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-neutral-darkest">Diagnosis:</h4>
                      <p className="text-sm text-neutral-dark mt-1">{record.diagnosis}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-neutral-darkest">Resep/Penanganan:</h4>
                    <p className="text-sm text-neutral-dark mt-1">{record.prescription}</p>
                  </div>
                  
                  {record.notes && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-neutral-darkest">Catatan Tambahan:</h4>
                      <p className="text-sm text-neutral-dark mt-1">{record.notes}</p>
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-end space-x-2">
                    <button 
                      className="inline-flex items-center px-4 py-2 border border-primary text-sm font-medium rounded-md text-primary hover:bg-primary-lightest focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      <Download size={16} className="mr-2" />
                      Unduh Laporan
                    </button>
                    <button 
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Lihat Detail
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-neutral-dark">Tidak ada riwayat konsultasi yang ditemukan.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}