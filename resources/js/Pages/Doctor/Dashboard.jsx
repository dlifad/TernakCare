import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import DoctorLayout from '@/Layouts/DoctorLayout';
import ConsultationCard from '@/Components/Doctor/ConsultationCard';
import { Calendar, MessageCircle, Video, Users } from 'lucide-react';

export default function Dashboard() {
  const [pendingConsultations, setPendingConsultations] = useState([]);
  const [stats, setStats] = useState({
    totalConsultations: 0,
    chatConsultations: 0,
    videoConsultations: 0,
    visitConsultations: 0,
  });

  useEffect(() => {
    // Fetch pending consultations and stats from API
    // This would be replaced with actual API calls
    setPendingConsultations([
      { 
        id: 1, 
        farmerName: 'John Doe', 
        farmType: 'Sapi Perah', 
        date: '2025-05-08', 
        time: '09:00',
        type: 'chat',
        status: 'pending',
        issue: 'Pertanyaan tentang jadwal vaksinasi ternak',
      },
      { 
        id: 2, 
        farmerName: 'Alice Smith', 
        farmType: 'Peternakan Unggas', 
        date: '2025-05-08', 
        time: '11:30',
        type: 'video',
        status: 'pending',
        issue: 'Ayam menunjukkan gejala masalah pernapasan',
      },
      { 
        id: 3, 
        farmerName: 'Bob Johnson', 
        farmType: 'Peternakan Kambing', 
        date: '2025-05-09', 
        time: '10:00',
        type: 'visit',
        status: 'pending',
        issue: 'Butuh bantuan penilaian nutrisi untuk kambing bibit',
        location: 'Jl. Ternak No. 23, Bandung',
      },
    ]);

    setStats({
      totalConsultations: 48,
      chatConsultations: 25,
      videoConsultations: 15,
      visitConsultations: 8,
    });
  }, []);

  return (
    <DoctorLayout>
      <Head title="Dashboard Dokter" />
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-heading font-semibold text-neutral-darkest">Dashboard Dokter</h1>
          
          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow-soft rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 rounded-md p-3 bg-secondary-light">
                    <Users size={24} className="text-secondary" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-neutral truncate">Total Konsultasi</dt>
                      <dd>
                        <div className="text-lg font-semibold text-neutral-darkest">{stats.totalConsultations}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow-soft rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 rounded-md p-3 bg-primary-light">
                    <MessageCircle size={24} className="text-primary" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-neutral truncate">Konsultasi Chat</dt>
                      <dd>
                        <div className="text-lg font-semibold text-neutral-darkest">{stats.chatConsultations}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow-soft rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 rounded-md p-3 bg-accent-light">
                    <Video size={24} className="text-accent" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-neutral truncate">Konsultasi Video</dt>
                      <dd>
                        <div className="text-lg font-semibold text-neutral-darkest">{stats.videoConsultations}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow-soft rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 rounded-md p-3 bg-warning bg-opacity-20">
                    <Calendar size={24} className="text-warning" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-neutral truncate">Kunjungan Peternakan</dt>
                      <dd>
                        <div className="text-lg font-semibold text-neutral-darkest">{stats.visitConsultations}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Pending Consultations */}
          <div className="mt-8">
            <h2 className="text-xl font-heading font-medium text-neutral-darkest mb-4">Konsultasi Tertunda</h2>
            
            <div className="space-y-4">
              {pendingConsultations.map((consultation) => (
                <ConsultationCard key={consultation.id} consultation={consultation} />
              ))}
              
              {pendingConsultations.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow-soft">
                  <div className="text-neutral">Tidak ada konsultasi tertunda saat ini</div>
                </div>
              )}
            </div>
          </div>
          
          {/* Schedule for today */}
          <div className="mt-8">
            <h2 className="text-xl font-heading font-medium text-neutral-darkest mb-4">Jadwal Hari Ini</h2>
            
            <div className="bg-white shadow-soft rounded-lg overflow-hidden">
              <div className="divide-y divide-neutral-light">
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-primary-light p-2 rounded-md">
                      <MessageCircle size={20} className="text-primary" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-neutral-darkest">Chat dengan Richard Cooper</h3>
                      <p className="text-xs text-neutral mt-1">09:30 - Nutrisi Sapi Perah</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-xs rounded-full bg-success bg-opacity-10 text-success">
                    Selesai
                  </span>
                </div>
                
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-accent-light p-2 rounded-md">
                      <Video size={20} className="text-accent" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-neutral-darkest">Panggilan Video dengan John Doe</h3>
                      <p className="text-xs text-neutral mt-1">13:00 - Pemeriksaan Kesehatan Sapi Perah</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-xs rounded-full bg-warning bg-opacity-10 text-warning">
                    Akan Datang
                  </span>
                </div>
                
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-warning bg-opacity-20 p-2 rounded-md">
                      <Calendar size={20} className="text-warning" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-neutral-darkest">Kunjungan ke Peternakan Alice Smith</h3>
                      <p className="text-xs text-neutral mt-1">15:30 - Penilaian Kesehatan Unggas</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-xs rounded-full bg-warning bg-opacity-10 text-warning">
                    Akan Datang
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}