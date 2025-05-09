import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, GraduationCap, Languages, Award, Edit2, Save, X as CloseIcon, Lock } from 'lucide-react';
import DoctorLayout from '@/Layouts/DoctorLayout';
import { 
  TextInput, 
  TextArea, 
  PasswordInput, 
  FormSection 
} from '@/Components/Form';

export default function DoctorProfile({ auth, doctor }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const { data, setData, post, processing, errors, reset } = useForm({
    name: doctor.name || '',
    email: doctor.email || '',
    phone: doctor.phone || '',
    address: doctor.address || '',
    specialization: doctor.specialization || '',
    experience: doctor.experience || '',
    education: doctor.education || '',
    languages: doctor.languages || '',
    certifications: doctor.certifications || '',
    about: doctor.about || ''
  });
  
  const passwordForm = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/doctor/profile/update', {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  };

  const cancelEdit = () => {
    reset();
    setIsEditing(false);
  };
  
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    passwordForm.post('/doctor/password/update', {
      onSuccess: () => {
        setShowPasswordModal(false);
        passwordForm.reset();
      },
    });
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    passwordForm.reset();
    passwordForm.clearErrors();
  };

  return (
    <DoctorLayout>
      <Head title="Profil Dokter" />

      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-neutral-darkest">Profil Dokter</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="inline-flex items-center px-4 py-2 bg-neutral-light text-neutral-dark text-sm font-medium rounded-md hover:bg-neutral transition-colors"
            >
              <Lock size={16} className="mr-2" />
              Ubah Password
            </button>
            
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 bg-secondary text-white text-sm font-medium rounded-md hover:bg-secondary-dark transition-colors"
              >
                <Edit2 size={16} className="mr-2" />
                Edit Profil
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={cancelEdit}
                  className="inline-flex items-center px-4 py-2 bg-neutral-light text-neutral-dark text-sm font-medium rounded-md hover:bg-neutral transition-colors"
                >
                  <CloseIcon size={16} className="mr-2" />
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={processing}
                  className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors"
                >
                  <Save size={16} className="mr-2" />
                  Simpan
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow-card rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-secondary-light p-6">
            <div className="flex flex-col sm:flex-row items-center">
              <div className="w-24 h-24 bg-secondary-dark text-white rounded-full flex items-center justify-center text-3xl font-bold mb-4 sm:mb-0">
                {doctor.name?.charAt(0) || 'D'}
              </div>
              <div className="sm:ml-6 text-center sm:text-left">
                <h2 className="text-xl font-bold text-secondary-dark">Dr. {doctor.name}</h2>
                <p className="text-secondary">{doctor.specialization}</p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          {!isEditing ? (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b border-neutral-light pb-2">Informasi Pribadi</h3>
                  
                  <div className="flex items-start">
                    <User size={20} className="mt-1 text-neutral" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-neutral-darkest">Nama Lengkap</p>
                      <p className="text-sm text-neutral-dark">Dr. {doctor.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Mail size={20} className="mt-1 text-neutral" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-neutral-darkest">Email</p>
                      <p className="text-sm text-neutral-dark">{doctor.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Phone size={20} className="mt-1 text-neutral" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-neutral-darkest">Nomor Telepon</p>
                      <p className="text-sm text-neutral-dark">{doctor.phone || '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <MapPin size={20} className="mt-1 text-neutral" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-neutral-darkest">Alamat</p>
                      <p className="text-sm text-neutral-dark">{doctor.address || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b border-neutral-light pb-2">Informasi Profesional</h3>
                  
                  <div className="flex items-start">
                    <Briefcase size={20} className="mt-1 text-neutral" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-neutral-darkest">Spesialisasi</p>
                      <p className="text-sm text-neutral-dark">{doctor.specialization || '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Calendar size={20} className="mt-1 text-neutral" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-neutral-darkest">Pengalaman</p>
                      <p className="text-sm text-neutral-dark">{doctor.experience || '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <GraduationCap size={20} className="mt-1 text-neutral" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-neutral-darkest">Pendidikan</p>
                      <p className="text-sm text-neutral-dark">{doctor.education || '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Languages size={20} className="mt-1 text-neutral" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-neutral-darkest">Bahasa</p>
                      <p className="text-sm text-neutral-dark">{doctor.languages || 'Indonesia'}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Award size={20} className="mt-1 text-neutral" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-neutral-darkest">Sertifikasi</p>
                      <p className="text-sm text-neutral-dark">{doctor.certifications || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* About Me */}
              <div className="mt-6">
                <h3 className="font-semibold text-lg border-b border-neutral-light pb-2">Tentang Saya</h3>
                <p className="mt-3 text-sm text-neutral-dark">
                  {doctor.about || 'Belum ada informasi tentang dokter.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information Edit Form */}
                  <FormSection title="Informasi Pribadi">
                    <TextInput
                      id="name"
                      label="Nama Lengkap"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      icon={<User size={16} className="text-neutral" />}
                      error={errors.name}
                      required
                    />

                    <TextInput
                      id="email"
                      label="Email"
                      type="email"
                      value={data.email}
                      onChange={(e) => setData('email', e.target.value)}
                      icon={<Mail size={16} className="text-neutral" />}
                      error={errors.email}
                      required
                    />

                    <TextInput
                      id="phone"
                      label="Nomor Telepon"
                      value={data.phone}
                      onChange={(e) => setData('phone', e.target.value)}
                      icon={<Phone size={16} className="text-neutral" />}
                      error={errors.phone}
                    />

                    <TextArea
                      id="address"
                      label="Alamat"
                      value={data.address}
                      onChange={(e) => setData('address', e.target.value)}
                      rows={3}
                      icon={<MapPin size={16} className="text-neutral" />}
                      error={errors.address}
                    />
                  </FormSection>

                  {/* Professional Information Edit Form */}
                  <FormSection title="Informasi Profesional">
                    <TextInput
                      id="specialization"
                      label="Spesialisasi"
                      value={data.specialization}
                      onChange={(e) => setData('specialization', e.target.value)}
                      icon={<Briefcase size={16} className="text-neutral" />}
                      error={errors.specialization}
                    />

                    <TextInput
                      id="experience"
                      label="Pengalaman"
                      value={data.experience}
                      onChange={(e) => setData('experience', e.target.value)}
                      icon={<Calendar size={16} className="text-neutral" />}
                      placeholder="Contoh: 5 tahun"
                      error={errors.experience}
                    />

                    <TextInput
                      id="education"
                      label="Pendidikan"
                      value={data.education}
                      onChange={(e) => setData('education', e.target.value)}
                      icon={<GraduationCap size={16} className="text-neutral" />}
                      placeholder="Contoh: Dokter Hewan - Universitas Indonesia"
                      error={errors.education}
                    />

                    <TextInput
                      id="languages"
                      label="Bahasa"
                      value={data.languages}
                      onChange={(e) => setData('languages', e.target.value)}
                      icon={<Languages size={16} className="text-neutral" />}
                      placeholder="Contoh: Indonesia, Inggris"
                      error={errors.languages}
                    />

                    <TextInput
                      id="certifications"
                      label="Sertifikasi"
                      value={data.certifications}
                      onChange={(e) => setData('certifications', e.target.value)}
                      icon={<Award size={16} className="text-neutral" />}
                      error={errors.certifications}
                    />
                  </FormSection>
                </div>

                {/* About Me Edit Form */}
                <div className="mt-6">
                  <FormSection title="Tentang Saya">
                    <TextArea
                      id="about"
                      value={data.about}
                      onChange={(e) => setData('about', e.target.value)}
                      rows={5}
                      placeholder="Ceritakan tentang pengalaman profesional Anda..."
                      error={errors.about}
                    />
                  </FormSection>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <>
          <div className="fixed inset-0 bg-neutral-darkest bg-opacity-75 z-40" onClick={closePasswordModal}></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-card max-w-md w-full">
              <div className="p-4 border-b border-neutral-light flex justify-between items-center">
                <h3 className="text-lg font-medium text-neutral-darkest">Ubah Password</h3>
                <button onClick={closePasswordModal} className="text-neutral hover:text-neutral-dark">
                  <CloseIcon size={20} />
                </button>
              </div>
              
              <form onSubmit={handlePasswordSubmit} className="p-4">
                <div className="space-y-4">
                  <PasswordInput
                    id="current_password"
                    label="Password Saat Ini"
                    value={passwordForm.data.current_password}
                    onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                    error={passwordForm.errors.current_password}
                    required
                  />
                  
                  <PasswordInput
                    id="password"
                    label="Password Baru"
                    value={passwordForm.data.password}
                    onChange={(e) => passwordForm.setData('password', e.target.value)}
                    error={passwordForm.errors.password}
                    required
                  />
                  
                  <PasswordInput
                    id="password_confirmation"
                    label="Konfirmasi Password Baru"
                    value={passwordForm.data.password_confirmation}
                    onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                    error={passwordForm.errors.password_confirmation}
                    required
                  />
                </div>
                
                <div className="mt-6 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={closePasswordModal}
                    className="px-4 py-2 bg-neutral-light text-neutral-dark text-sm font-medium rounded-md hover:bg-neutral transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={passwordForm.processing}
                    className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors"
                  >
                    Ubah Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </DoctorLayout>
  );
}