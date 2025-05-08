import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { MessageSquare, Video, Map, Clock, Calendar, Search } from 'lucide-react';
import FarmerLayout from '@/Layouts/FarmerLayout';
import ConsultationRequest from '@/Components/Farmer/ConsultationRequest';

export default function CallDoctor({ auth, doctors, upcomingConsultations }) {
  const [consultationType, setConsultationType] = useState('chat');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('');
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const consultationTypeOptions = [
    { id: 'chat', name: 'Chat', icon: MessageSquare },
    { id: 'video', name: 'Video Call', icon: Video },
    { id: 'visit', name: 'Kunjungan', icon: Map },
  ];

  const specializations = [
    { id: '', name: 'Semua Spesialisasi' },
    { id: 'umum', name: 'Dokter Hewan Umum' },
    { id: 'sapi', name: 'Spesialis Sapi' },
    { id: 'unggas', name: 'Spesialis Unggas' },
    { id: 'kambing', name: 'Spesialis Kambing' },
    { id: 'domba', name: 'Spesialis Domba' },
  ];

  // Filter doctors based on search and specialization
  const filteredDoctors = doctors?.filter(doctor => {
    const matchesSearch = !searchTerm || 
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesSpecialization = !filterSpecialization || 
      doctor.specialization === filterSpecialization;
      
    return matchesSearch && matchesSpecialization;
  });

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setShowConsultationModal(true);
  };

  return (
    <FarmerLayout user={auth.user}>
      <Head title="Panggil Dokter" />
      
      <div className="mb-6">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-neutral-darkest mb-2">
          Panggil Dokter Hewan
        </h1>
        <p className="text-neutral-dark">
          Konsultasikan masalah peternakan Anda dengan dokter hewan profesional
        </p>
      </div>

      {/* Upcoming Consultations */}
      {upcomingConsultations && upcomingConsultations.length > 0 && (
        <div className="mb-8">
          <h2 className="font-heading text-xl font-semibold text-neutral-darkest mb-4">
            Konsultasi Mendatang
          </h2>
          <div className="bg-white rounded-xl shadow-card p-4">
            {upcomingConsultations.map(consultation => (
              <div 
                key={consultation.id} 
                className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 border-b border-neutral-lightest last:border-b-0"
              >
                <div className="flex items-center mb-3 md:mb-0">
                  <img 
                    src={consultation.doctor.profile_photo_url || '/storage/images/default-avatar.png'} 
                    alt={consultation.doctor.name}
                    className="h-10 w-10 rounded-full object-cover mr-3"
                  />
                  <div>
                    <h3 className="font-medium text-neutral-darkest">
                      {consultation.doctor.name}
                    </h3>
                    <p className="text-sm text-neutral">
                      {consultation.doctor.specialization}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center">
                  <div className="flex items-center mr-4 mb-2 md:mb-0">
                    <Calendar className="h-4 w-4 text-primary mr-1" />
                    <span className="text-sm text-neutral-dark">
                      {new Date(consultation.scheduled_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <div className="flex items-center mr-4 mb-2 md:mb-0">
                    <Clock className="h-4 w-4 text-primary mr-1" />
                    <span className="text-sm text-neutral-dark">
                      {new Date(consultation.scheduled_at).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className={`
                      px-2 py-1 text-xs rounded-full
                      ${consultation.type === 'chat' ? 'bg-info/10 text-info' : 
                        consultation.type === 'video' ? 'bg-primary/10 text-primary' : 
                        'bg-secondary/10 text-secondary'}
                    `}>
                      {consultation.type === 'chat' ? 'Chat' : 
                        consultation.type === 'video' ? 'Video Call' : 
                        'Kunjungan'}
                    </span>
                  </div>
                </div>
                <button className="mt-3 md:mt-0 px-3 py-1 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition duration-300">
                  Lihat Detail
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consultation Type Selection */}
      <div className="mb-8">
        <h2 className="font-heading text-xl font-semibold text-neutral-darkest mb-4">
          Pilih Jenis Konsultasi
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {consultationTypeOptions.map(option => (
            <button
              key={option.id}
              onClick={() => setConsultationType(option.id)}
              className={`
                flex flex-col items-center justify-center p-4 rounded-xl transition-all
                ${consultationType === option.id 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'bg-white text-neutral-dark hover:bg-primary-light hover:text-primary shadow-card'}
              `}
            >
              <option.icon className={`h-8 w-8 mb-2 ${consultationType === option.id ? 'text-white' : 'text-primary'}`} />
              <span className="font-medium">{option.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <input
              type="text"
              placeholder="Cari dokter hewan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral" size={18} />
          </div>
          <select
            value={filterSpecialization}
            onChange={(e) => setFilterSpecialization(e.target.value)}
            className="px-4 py-2 rounded-lg border border-neutral-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {specializations.map(spec => (
              <option key={spec.id} value={spec.id}>{spec.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctors List */}
      <div className="mb-6">
        <h2 className="font-heading text-xl font-semibold text-neutral-darkest mb-4">
          Dokter Hewan Tersedia
        </h2>
        
        {filteredDoctors && filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDoctors.map(doctor => (
              <div 
                key={doctor.id}
                className="bg-white rounded-xl shadow-card overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center p-4">
                  <img 
                    src={doctor.profile_photo_url || '/storage/images/default-avatar.png'} 
                    alt={doctor.name}
                    className="h-16 w-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-medium text-neutral-darkest">
                      {doctor.name}
                    </h3>
                    <p className="text-sm text-primary mb-1">
                      {doctor.specialization}
                    </p>
                    <div className="flex items-center text-sm text-neutral">
                      <span className="flex items-center mr-3">
                        <Star className="h-4 w-4 text-warning fill-current mr-1" />
                        {doctor.rating}
                      </span>
                      <span>{doctor.experience} tahun</span>
                    </div>
                  </div>
                </div>
                
                <div className="px-4 pb-4">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <span className="text-xs text-neutral">Biaya Konsultasi</span>
                      <p className="font-medium text-neutral-darkest">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0
                        }).format(doctor[`${consultationType}_fee`] || 0)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDoctorSelect(doctor)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition duration-300"
                    >
                      Pilih
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-card p-8 text-center">
            <p className="text-neutral-dark">Tidak ada dokter yang tersedia sesuai kriteria Anda</p>
          </div>
        )}
      </div>

      {/* Consultation Request Modal */}
      {showConsultationModal && selectedDoctor && (
        <ConsultationRequest
          doctor={selectedDoctor}
          consultationType={consultationType}
          onClose={() => setShowConsultationModal(false)}
        />
      )}
    </FarmerLayout>
  );
}