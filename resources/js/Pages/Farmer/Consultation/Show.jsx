import React from "react";
import { Head, Link } from '@inertiajs/react';
import FarmerLayout from '@/Layouts/FarmerLayout';
import { format } from '@/Components/Common/format';
import { 
  Clock, 
  MessageCircle, 
  Video, 
  MapPin, 
  ArrowLeft,
  CreditCard,
  MessageSquare
} from 'lucide-react';

const ConsultationShow = ({ consultation, auth }) => {
  // Render status badge dengan warna sesuai status
  const StatusBadge = ({ status }) => {
    const statusColors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-blue-100 text-blue-800',
      'active': 'bg-green-100 text-green-800',
      'completed': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800',
      'rejected': 'bg-red-100 text-red-800',
    };
    
    const statusLabels = {
      'pending': 'Menunggu',
      'approved': 'Disetujui',
      'active': 'Aktif',
      'completed': 'Selesai',
      'cancelled': 'Dibatalkan',
      'rejected': 'Ditolak',
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status] || 'bg-gray-100'}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  // Render ikon sesuai tipe konsultasi
  const ConsultationTypeIcon = ({ type }) => {
    if (type === 'chat') return <MessageCircle className="w-5 h-5" />;
    if (type === 'video' || type === 'video_call') return <Video className="w-5 h-5" />;
    if (type === 'visit') return <MapPin className="w-5 h-5" />;
    return null;
  };

  // Render tombol sesuai status pembayaran
    const ActionButton = () => {
    // Jika status konsultasi bukan approved, tombol tidak perlu ditampilkan
    if (consultation.status !== 'approved') {
        return null;
    }

    if (!consultation.is_paid) {
        // SOLUSI: Gunakan Link dengan benar, tanpa method="get" 
        return (
        <Link 
            href={route('farmer.consultations.payment', consultation.id)} 
            className="flex items-center justify-center w-full px-4 py-2 mt-6 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            // Hapus method="get" karena Link sudah menggunakan GET secara default
            // as="button" juga tidak diperlukan untuk navigasi normal
        >
            <CreditCard className="w-5 h-5 mr-2" />
            Bayar Sekarang
        </Link>
        );
    } else {
      // Tombol hanya ditampilkan untuk konsultasi chat
      if (consultation.type === 'chat') {
        return (
          <Link 
            href={route('farmer.consultations.chat', consultation.id)} 
            className="flex items-center justify-center w-full px-4 py-2 mt-6 font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Chat Sekarang
          </Link>
        );
      } else if (consultation.type === 'video' || consultation.type === 'video_call') {
        // Untuk konsultasi video
        return (
          <Link 
            href={route('farmer.consultations.join-video', consultation.id)} 
            className="flex items-center justify-center w-full px-4 py-2 mt-6 font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            <Video className="w-5 h-5 mr-2" />
            Mulai Video Call
          </Link>
        );
      } else {
        // Untuk konsultasi kunjungan, mungkin tidak perlu tombol khusus
        return null;
      }
    }
  };

  return (
    <FarmerLayout>
      <Head title={`Konsultasi dengan ${consultation.doctor.user.name}`} />

      <div className="py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Navigation */}
          <div className="mb-6">
            <Link 
              href={route('farmer.consultations.index')}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Kembali ke Daftar Konsultasi
            </Link>
          </div>

          {/* Header */}
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img 
                    src={consultation.doctor.user.profile_photo_url || '/storage/images/default-avatar.png'} 
                    alt={consultation.doctor.user.name}
                    className="w-16 h-16 rounded-full object-cover" 
                  />
                  <div>
                    <h2 className="text-xl font-semibold">{consultation.doctor.user.name}</h2>
                    <div className="flex items-center mt-1">
                      <ConsultationTypeIcon type={consultation.type} />
                      <span className="ml-1">
                        {consultation.type === 'chat' ? 'Konsultasi Chat' : 
                         consultation.type === 'video' || consultation.type === 'video_call' ? 'Konsultasi Video Call' : 
                         'Konsultasi Kunjungan'}
                      </span>
                    </div>
                    <StatusBadge status={consultation.status} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">ID: #{consultation.id}</p>
                  <p className="text-sm text-gray-600">
                    {format.formatDate(consultation.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Informasi */}
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Detail Konsultasi</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Jenis Hewan</p>
                  <p className="font-medium">{consultation.animal_type || '-'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <StatusBadge status={consultation.status} />
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Keluhan</p>
                  <p className="font-medium">{consultation.issue || '-'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Biaya</p>
                  <p className="font-medium">Rp {consultation.fee?.toLocaleString('id-ID') || '0'}</p>
                </div>
                
                {/* Status Pembayaran */}
                <div>
                  <p className="text-sm text-gray-600">Status Pembayaran</p>
                  <p className={`font-medium ${consultation.is_paid ? 'text-green-600' : 'text-red-600'}`}>
                    {consultation.is_paid ? 'Sudah Dibayar' : 'Belum Dibayar'}
                  </p>
                </div>
                
                {/* Tampilkan jadwal hanya jika bukan chat */}
                {consultation.type !== 'chat' && consultation.schedule && (
                  <div>
                    <p className="text-sm text-gray-600">Jadwal</p>
                    <p className="font-medium flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {format.formatDate(consultation.schedule)}
                    </p>
                  </div>
                )}
                
                {consultation.type === 'visit' && consultation.location && (
                  <div>
                    <p className="text-sm text-gray-600">Lokasi</p>
                    <p className="font-medium flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {consultation.location}
                    </p>
                  </div>
                )}
              </div>

              {consultation.description && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Deskripsi Tambahan</p>
                  <p className="font-medium">{consultation.description}</p>
                </div>
              )}
              
              {/* Tombol Action (Bayar/Chat) */}
              <ActionButton />
            </div>
          </div>
        </div>
      </div>
    </FarmerLayout>
  );
};

export default ConsultationShow;