import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { User, Mail, Phone, MapPin, Camera, Save, X, Lock } from 'lucide-react';
import FarmerLayout from '@/Layouts/FarmerLayout';
import Button from '@/Components/Common/Button';
import Alert from '@/Components/Common/Alert';

// New form components (similar to the shop profile)
const TextInput = ({ id, label, type = 'text', value, onChange, icon, error, ...props }) => (
  <div className="space-y-1">
    <label htmlFor={id} className="block text-sm font-medium text-neutral-dark">
      {label}
    </label>
    <div className="relative rounded-md">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
      )}
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        className={`block w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border ${
          error ? 'border-danger' : 'border-neutral-light'
        } rounded-md focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm`}
        {...props}
      />
    </div>
    {error && <p className="text-sm text-danger">{error}</p>}
  </div>
);

const TextArea = ({ id, label, value, onChange, rows = 3, icon, error, ...props }) => (
  <div className="space-y-1">
    <label htmlFor={id} className="block text-sm font-medium text-neutral-dark">
      {label}
    </label>
    <div className="relative rounded-md">
      {icon && (
        <div className="absolute top-3 left-3 pointer-events-none">
          {icon}
        </div>
      )}
      <textarea
        id={id}
        name={id}
        rows={rows}
        value={value}
        onChange={onChange}
        className={`block w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border ${
          error ? 'border-danger' : 'border-neutral-light'
        } rounded-md focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm`}
        {...props}
      />
    </div>
    {error && <p className="text-sm text-danger">{error}</p>}
  </div>
);

const PasswordInput = ({ id, label, value, onChange, error, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-neutral-dark">
        {label}
      </label>
      <div className="relative rounded-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Lock size={18} className="text-neutral" />
        </div>
        <input
          id={id}
          name={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          className={`block w-full pl-10 pr-10 py-2 border ${
            error ? 'border-danger' : 'border-neutral-light'
          } rounded-md focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm`}
          {...props}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral hover:text-neutral-dark"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
};

const FormSection = ({ title, children }) => (
  <div className="space-y-4">
    <h3 className="font-semibold text-lg border-b border-neutral-light pb-2">{title}</h3>
    {children}
  </div>
);

export default function Profile({ auth }) {
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Form Profile
  const { data, setData, patch, processing, errors, reset } = useForm({
    name: '',
    email: '',
    phone: '',
    address: '',
    photo: null,
    photo_url: '',
  });

  // Form Password
  const passwordForm = useForm({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  useEffect(() => {
    if (auth?.user) {
      setData({
        name: auth.user.name || '',
        email: auth.user.email || '',
        phone: auth.user.phone || '',
        address: auth.user.address || '',
        photo: null,
        photo_url: auth.user.photo_url || '/api/placeholder/100/100',
      });
    }
  }, [auth]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData('photo', file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    patch(route('farmer.profile.update'), {
      onSuccess: () => {
        setIsEditing(false);
        setSuccessMessage('Profil berhasil diperbarui');
        setTimeout(() => setSuccessMessage(''), 3000);
        setPhotoPreview(null);
      },
    });
  };

  const cancelEdit = () => {
    reset();
    setIsEditing(false);
    setPhotoPreview(null);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordLoading(true);

    window.axios.post(route('farmer.profile.update-password'), {
      current_password: passwordForm.data.current_password,
      new_password: passwordForm.data.new_password,
      new_password_confirmation: passwordForm.data.new_password_confirmation
    })
      .then(() => {
        setSuccessMessage('Password berhasil diperbarui');
        setTimeout(() => setSuccessMessage(''), 3000);
        passwordForm.reset();
        setShowPasswordModal(false);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setPasswordLoading(false);
      });
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    passwordForm.reset();
  };

  return (
    <FarmerLayout>
      <Head title="Profil Peternak" />

      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-darkest">Profil Peternak</h1>
            <p className="text-neutral-dark">Kelola informasi profil dan pengaturan akun Anda</p>
          </div>
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
                className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors"
              >
                <Save size={16} className="mr-2" />
                Edit Profil
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={cancelEdit}
                  className="inline-flex items-center px-4 py-2 bg-neutral-light text-neutral-dark text-sm font-medium rounded-md hover:bg-neutral transition-colors"
                >
                  <X size={16} className="mr-2" />
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={processing}
                  className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors"
                >
                  <Save size={16} className="mr-2" />
                  {processing ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            )}
          </div>
        </div>

        {successMessage && (
          <Alert type="success" message={successMessage} className="mb-6" />
        )}

        <div className="bg-white shadow-card rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-neutral-lightest p-6">
            <div className="flex flex-col sm:flex-row items-center">
              <div className="relative mb-4 sm:mb-0 sm:mr-6">
                <div className="w-24 h-24 bg-primary-light text-primary border-4 border-white rounded-full flex items-center justify-center text-3xl font-bold overflow-hidden">
                  <img 
                    src={photoPreview || data.photo_url}
                    alt="Foto Profil"
                    className="w-full h-full object-cover"
                  />
                </div>
                {isEditing && (
                  <label htmlFor="photo-upload" className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-sm text-neutral-dark hover:text-primary cursor-pointer">
                    <Camera size={16} />
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </label>
                )}
              </div>
              <div className="sm:ml-6 text-center sm:text-left">
                <h2 className="text-xl font-bold text-neutral-darkest">{data.name}</h2>
                <p className="text-neutral-dark">Peternak</p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          {!isEditing ? (
            <div className="p-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b border-neutral-light pb-2">Informasi Profil</h3>
                
                <div className="flex items-start">
                  <User size={20} className="mt-1 text-neutral" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-neutral-darkest">Nama Lengkap</p>
                    <p className="text-sm text-neutral-dark">{data.name}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail size={20} className="mt-1 text-neutral" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-neutral-darkest">Email</p>
                    <p className="text-sm text-neutral-dark">{data.email}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Phone size={20} className="mt-1 text-neutral" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-neutral-darkest">Nomor Telepon</p>
                    <p className="text-sm text-neutral-dark">{data.phone || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin size={20} className="mt-1 text-neutral" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-neutral-darkest">Alamat</p>
                    <p className="text-sm text-neutral-dark">{data.address || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <FormSection title="Informasi Profil">
                  <TextInput
                    id="name"
                    label="Nama Lengkap"
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                    icon={<User size={18} className="text-neutral" />}
                    error={errors.name}
                  />
                  
                  <TextInput
                    id="email"
                    label="Email"
                    type="email"
                    value={data.email}
                    onChange={e => setData('email', e.target.value)}
                    icon={<Mail size={18} className="text-neutral" />}
                    error={errors.email}
                  />
                  
                  <TextInput
                    id="phone"
                    label="Nomor Telepon"
                    value={data.phone}
                    onChange={e => setData('phone', e.target.value)}
                    icon={<Phone size={18} className="text-neutral" />}
                    error={errors.phone}
                  />
                  
                  <TextArea
                    id="address"
                    label="Alamat"
                    value={data.address}
                    onChange={e => setData('address', e.target.value)}
                    rows={3}
                    icon={<MapPin size={18} className="text-neutral" />}
                    error={errors.address}
                  />
                </FormSection>
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
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handlePasswordSubmit} className="p-4">
                <div className="space-y-4">
                  <PasswordInput
                    id="current_password"
                    label="Password Saat Ini"
                    value={passwordForm.data.current_password}
                    onChange={e => passwordForm.setData('current_password', e.target.value)}
                    error={passwordForm.errors.current_password}
                    required
                  />
                  
                  <PasswordInput
                    id="new_password"
                    label="Password Baru"
                    value={passwordForm.data.new_password}
                    onChange={e => passwordForm.setData('new_password', e.target.value)}
                    error={passwordForm.errors.new_password}
                    required
                  />
                  
                  <PasswordInput
                    id="new_password_confirmation"
                    label="Konfirmasi Password Baru"
                    value={passwordForm.data.new_password_confirmation}
                    onChange={e => passwordForm.setData('new_password_confirmation', e.target.value)}
                    error={passwordForm.errors.new_password_confirmation}
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
                    disabled={passwordLoading}
                    className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors"
                  >
                    {passwordLoading ? 'Memproses...' : 'Ubah Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </FarmerLayout>
  );
}