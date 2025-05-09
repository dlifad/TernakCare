import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import DoctorLayout from '@/Layouts/DoctorLayout';
import { Search, Calendar, Clock, MessageCircle, Filter, ChevronDown, UserCircle, Video, MapPin } from 'lucide-react';

export default function DoctorConsultation({ consultations = [] }) {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data with consultation type included
  const mockConsultations = [
    {
      id: 1,
      patient_name: 'Ahmad Farhan',
      status: 'pending',
      date: '10 Mei 2025',
      time: '09:00 - 10:00',
      animal_type: 'Sapi',
      consultation_type: 'chat',
      complaint: 'Sapi tidak mau makan selama 2 hari terakhir dan terlihat lesu',
      image: null,
    },
    {
      id: 2,
      patient_name: 'Budi Santoso',
      status: 'scheduled',
      date: '10 Mei 2025',
      time: '13:00 - 14:00',
      animal_type: 'Kambing',
      consultation_type: 'video',
      complaint: 'Kambing mengalami diare dan tidak aktif seperti biasanya',
      image: null,
    },
    {
      id: 3,
      patient_name: 'Dewi Lestari',
      status: 'completed',
      date: '8 Mei 2025',
      time: '10:00 - 11:00',
      animal_type: 'Ayam',
      consultation_type: 'visit',
      complaint: 'Beberapa ayam mengalami gejala flu dan produksi telur menurun',
      image: null,
    },
  ];
  
  const allConsultations = consultations.length > 0 ? consultations : mockConsultations;
  
  // Filter consultations based on status and search query
  const filteredConsultations = allConsultations.filter(consultation => {
    const matchesFilter = filter === 'all' || consultation.status === filter;
    const matchesSearch = consultation.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          consultation.animal_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          consultation.complaint.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  
  const statusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Menunggu Konfirmasi' },
      scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Terjadwal' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Selesai' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Dibatalkan' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };
  
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
  
  return (
    <DoctorLayout>
      <Head title="Konsultasi" />
      
      <div className="py-6 px-4 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-neutral-darkest">Konsultasi</h1>
          <p className="text-neutral-dark mt-1">Kelola permintaan konsultasi dari peternak</p>
        </div>
        
        <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-neutral" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-neutral-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Cari nama pasien, jenis hewan, atau keluhan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative inline-block text-left">
              <div>
                <button
                  type="button"
                  className="inline-flex justify-center items-center w-full rounded-md border border-neutral-light px-4 py-2 bg-white text-sm font-medium text-neutral-darkest hover:bg-neutral-lightest focus:outline-none focus:ring-2 focus:ring-primary"
                  id="filter-menu"
                  aria-expanded="true"
                  aria-haspopup="true"
                >
                  <Filter size={16} className="mr-2 text-neutral" />
                  Filter Status
                  <ChevronDown size={16} className="ml-2 text-neutral" />
                </button>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                className={`px-3 py-1 text-sm rounded-md transition-colors ${filter === 'all' ? 'bg-primary text-white' : 'bg-white border border-neutral-light text-neutral-dark hover:bg-neutral-lightest'}`}
                onClick={() => setFilter('all')}
              >
                Semua
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-md transition-colors ${filter === 'pending' ? 'bg-primary text-white' : 'bg-white border border-neutral-light text-neutral-dark hover:bg-neutral-lightest'}`}
                onClick={() => setFilter('pending')}
              >
                Menunggu
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-md transition-colors ${filter === 'scheduled' ? 'bg-primary text-white' : 'bg-white border border-neutral-light text-neutral-dark hover:bg-neutral-lightest'}`}
                onClick={() => setFilter('scheduled')}
              >
                Terjadwal
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-md transition-colors ${filter === 'completed' ? 'bg-primary text-white' : 'bg-white border border-neutral-light text-neutral-dark hover:bg-neutral-lightest'}`}
                onClick={() => setFilter('completed')}
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-card overflow-hidden">
          <div className="divide-y divide-neutral-light">
            {filteredConsultations.length > 0 ? (
              filteredConsultations.map((consultation) => (
                <div key={consultation.id} className="p-4 hover:bg-neutral-lightest transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <UserCircle size={48} className="text-neutral" />
                      </div>
                      <div>
                        <h3 className="font-medium text-neutral-darkest">{consultation.patient_name}</h3>
                        <p className="text-sm text-neutral-dark">{consultation.animal_type}</p>
                        <div className="mt-1 flex items-center space-x-2">
                          {statusBadge(consultation.status)}
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${consultationTypeClass(consultation.consultation_type)}`}>
                            {consultationTypeIcon(consultation.consultation_type)}
                            {consultationTypeLabel(consultation.consultation_type)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 lg:mt-0 flex flex-col lg:items-end space-y-2">
                      <div className="flex items-center text-sm text-neutral-dark">
                        <Calendar size={16} className="mr-1" />
                        {consultation.date}
                      </div>
                      <div className="flex items-center text-sm text-neutral-dark">
                        <Clock size={16} className="mr-1" />
                        {consultation.time}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-neutral-darkest">Keluhan:</h4>
                    <p className="text-sm text-neutral-dark mt-1">{consultation.complaint}</p>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <button 
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      {consultation.consultation_type === 'chat' ? (
                        <MessageCircle size={16} className="mr-2" />
                      ) : consultation.consultation_type === 'video' ? (
                        <Video size={16} className="mr-2" />
                      ) : (
                        <MapPin size={16} className="mr-2" />
                      )}
                      
                      {consultation.status === 'pending' ? 'Terima Konsultasi' : 
                       consultation.status === 'scheduled' ? 
                        (consultation.consultation_type === 'chat' ? 'Mulai Chat' : 
                         consultation.consultation_type === 'video' ? 'Mulai Video Call' : 
                         'Lihat Detail Kunjungan') : 
                        'Lihat Detail'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-neutral-dark">Tidak ada konsultasi yang ditemukan.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}