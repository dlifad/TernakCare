import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { MessageSquare, Video, Map, Calendar, Clock, X } from 'lucide-react';

export default function ConsultationRequest({ doctor, consultationType, onClose }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  
  const { data, setData, post, processing, errors } = useForm({
    doctor_id: doctor.id,
    type: consultationType,
    description: '',
    scheduled_date: '',
    scheduled_time: '',
    animal_type: '',
    symptoms: '',
    address: '',
  });

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setData('scheduled_date', e.target.value);
  };

  const handleTimeChange = (e) => {
    setSelectedTime(e.target.value);
    setData('scheduled_time', e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('farmer.consultations.store'), {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const getConsultationTypeIcon = () => {
    switch (consultationType) {
      case 'chat':
        return <MessageSquare className="h-5 w-5 text-info" />;
      case 'video':
        return <Video className="h-5 w-5 text-primary" />;
      case 'visit':
        return <Map className="h-5 w-5 text-secondary" />;
      default:
        return <MessageSquare className="h-5 w-5 text-info" />;
    }
  };

  const getConsultationTypeName = () => {
    switch (consultationType) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-neutral-lightest">
          <h2 className="font-heading text-xl font-semibold text-neutral-darkest">
            Permintaan Konsultasi
          </h2>
          <button 
            onClick={onClose}
            className="text-neutral-dark hover:text-danger"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4">
          {/* Doctor Info */}
          <div className="flex items-center p-4 bg-neutral-lightest rounded-lg mb-6">
            <img 
              src={doctor.profile_photo_url || '/storage/images/default-avatar.png'} 
              alt={doctor.name}
              className="h-14 w-14 rounded-full object-cover mr-4"
            />
            <div>
              <h3 className="font-medium text-neutral-darkest">
                {doctor.name}
              </h3>
              <p className="text-sm text-primary mb-1">
                {doctor.specialization}
              </p>
              <div className="flex items-center">
                <span className="flex items-center bg-white px-2 py-1 rounded-full text-xs">
                  {getConsultationTypeIcon()}
                  <span className="ml-1">{getConsultationTypeName()}</span>
                </span>
                <span className="ml-2 text-sm text-neutral-dark font-medium">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0
                  }).format(doctor[`${consultationType}_fee`] || 0)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Consultation Form */}
          <form onSubmit={handleSubmit}>
            {/* Date and Time Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-darkest mb-1">
                Tanggal & Waktu Konsultasi
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral" size={16} />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={handleDateChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  {errors.scheduled_date && (
                    <p className="text-danger text-xs mt-1">{errors.scheduled_date}</p>
                  )}
                </div>
                <div>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral" size={16} />
                    <input
                      type="time"
                      value={selectedTime}
                      onChange={handleTimeChange}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  {errors.scheduled_time && (
                    <p className="text-danger text-xs mt-1">{errors.scheduled_time}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Animal Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-darkest mb-1">
                Jenis Hewan Ternak
              </label>
              <select
                value={data.animal_type}
                onChange={e => setData('animal_type', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-neutral-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="">Pilih Jenis Hewan</option>
                <option value="sapi">Sapi</option>
                <option value="kambing">Kambing</option>
                <option value="domba">Domba</option>
                <option value="ayam">Ayam</option>
                <option value="bebek">Bebek</option>
                <option value="lainnya">Lainnya</option>
              </select>
              {errors.animal_type && (
                <p className="text-danger text-xs mt-1">{errors.animal_type}</p>
              )}
            </div>
            
            {/* Symptoms */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-darkest mb-1">
                Gejala atau Masalah
              </label>
              <textarea
                value={data.symptoms}
                onChange={e => setData('symptoms', e.target.value)}
                rows="3"
                className="w-full px-4 py-2 rounded-lg border border-neutral-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Deskripsikan gejala atau masalah yang dialami ternak Anda"
                required
              ></textarea>
              {errors.symptoms && (
                <p className="text-danger text-xs mt-1">{errors.symptoms}</p>
              )}
            </div>
            
            {/* Address (only for visit type) */}
            {consultationType === 'visit' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-darkest mb-1">
                  Alamat Kunjungan
                </label>
                <textarea
                  value={data.address}
                  onChange={e => setData('address', e.target.value)}
                  rows="2"
                  className="w-full px-4 py-2 rounded-lg border border-neutral-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Masukkan alamat lengkap tempat kunjungan"
                  required
                ></textarea>
                {errors.address && (
                  <p className="text-danger text-xs mt-1">{errors.address}</p>
                )}
              </div>
            )}
            
            {/* Additional Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-darkest mb-1">
                Catatan Tambahan (Opsional)
              </label>
              <textarea
                value={data.description}
                onChange={e => setData('description', e.target.value)}
                rows="2"
                className="w-full px-4 py-2 rounded-lg border border-neutral-light focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Tambahkan informasi lain yang diperlukan"
              ></textarea>
              {errors.description && (
                <p className="text-danger text-xs mt-1">{errors.description}</p>
              )}
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 mr-3 border border-neutral-light text-neutral-dark rounded-lg hover:bg-neutral-lightest transition duration-300"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={processing}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition duration-300 disabled:opacity-70"
              >
                {processing ? 'Memproses...' : 'Kirim Permintaan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}