import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Clock, Camera, Save, X, CreditCard, Building } from 'lucide-react';
import ShopLayout from '@/Layouts/ShopLayout';
import { Head } from '@inertiajs/react';

export default function Profile({ auth }) {
  // Initial form state with sample data
  const [formData, setFormData] = useState({
    shop_name: auth.user.shop_name || 'Ternak Makmur',
    owner_name: auth.user.name || 'Budi Santoso',
    email: auth.user.email || 'budi@example.com',
    phone: '08123456789',
    address: 'Jl. Peternakan No. 123, Bogor, Jawa Barat',
    description: 'Toko perlengkapan peternakan dengan produk berkualitas untuk kebutuhan hewan ternak Anda. Menyediakan pakan, vitamin, obat-obatan, dan peralatan peternakan.',
    operating_hours: '08:00 - 17:00',
    bank_name: 'Bank Central Asia',
    account_number: '1234567890',
    account_name: 'Budi Santoso'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState('/api/placeholder/100/100');
  const [bannerImage, setBannerImage] = useState('/api/placeholder/800/200');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically handle form submission to update the profile
    console.log('Form submitted:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form data to original state
    setFormData({
      shop_name: auth.user.shop_name || 'Ternak Makmur',
      owner_name: auth.user.name || 'Budi Santoso',
      email: auth.user.email || 'budi@example.com',
      phone: '08123456789',
      address: 'Jl. Peternakan No. 123, Bogor, Jawa Barat',
      description: 'Toko perlengkapan peternakan dengan produk berkualitas untuk kebutuhan hewan ternak Anda. Menyediakan pakan, vitamin, obat-obatan, dan peralatan peternakan.',
      operating_hours: '08:00 - 17:00',
      bank_name: 'Bank Central Asia',
      account_number: '1234567890',
      account_name: 'Budi Santoso'
    });
    setIsEditing(false);
  };

  return (
    <ShopLayout user={auth.user}>
      <Head title="Profil" />
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-heading text-neutral-darkest">Profil Toko</h1>
          <p className="text-neutral-dark">Kelola informasi toko dan pengaturan akun Anda</p>
        </div>

        <div className="bg-white rounded-lg shadow-card overflow-hidden">
          {/* Banner Image */}
          <div className="relative h-48 bg-neutral-light">
            <img 
              src={bannerImage} 
              alt="Toko Banner" 
              className="w-full h-full object-cover"
            />
            {isEditing && (
              <button className="absolute bottom-4 right-4 p-2 bg-white bg-opacity-80 rounded-full shadow-sm text-neutral-dark hover:text-primary">
                <Camera size={20} />
              </button>
            )}
          </div>

          {/* Profile Header */}
          <div className="px-6 pt-6 pb-4 border-b border-neutral-light">
            <div className="flex flex-col sm:flex-row items-start sm:items-center">
              <div className="relative mr-6 mb-4 sm:mb-0">
                <div className="w-24 h-24 bg-neutral-light rounded-full overflow-hidden border-4 border-white -mt-12">
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-sm text-neutral-dark hover:text-primary">
                    <Camera size={16} />
                  </button>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-neutral-darkest">{formData.shop_name}</h2>
                <p className="text-neutral-dark">{formData.owner_name}</p>
              </div>
              <div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                  >
                    Edit Profil
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border border-neutral-light text-neutral-dark rounded-md hover:bg-neutral-lightest"
                    >
                      <X size={18} className="inline mr-1" />
                      Batal
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                    >
                      <Save size={18} className="inline mr-1" />
                      Simpan
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-neutral-darkest border-b border-neutral-light pb-2">Informasi Toko</h3>
                
                <div>
                  <label htmlFor="shop_name" className="block text-sm font-medium text-neutral-dark mb-1">
                    Nama Toko
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building size={18} className="text-neutral" />
                    </div>
                    <input
                      type="text"
                      id="shop_name"
                      name="shop_name"
                      value={formData.shop_name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="block w-full pl-10 pr-3 py-2 border border-neutral-light rounded-lg focus:ring-primary focus:border-primary disabled:bg-neutral-lightest disabled:text-neutral-dark"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="owner_name" className="block text-sm font-medium text-neutral-dark mb-1">
                    Nama Pemilik
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-neutral" />
                    </div>
                    <input
                      type="text"
                      id="owner_name"
                      name="owner_name"
                      value={formData.owner_name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="block w-full pl-10 pr-3 py-2 border border-neutral-light rounded-lg focus:ring-primary focus:border-primary disabled:bg-neutral-lightest disabled:text-neutral-dark"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-dark mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={18} className="text-neutral" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="block w-full pl-10 pr-3 py-2 border border-neutral-light rounded-lg focus:ring-primary focus:border-primary disabled:bg-neutral-lightest disabled:text-neutral-dark"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-neutral-dark mb-1">
                    Nomor Telepon
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone size={18} className="text-neutral" />
                    </div>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="block w-full pl-10 pr-3 py-2 border border-neutral-light rounded-lg focus:ring-primary focus:border-primary disabled:bg-neutral-lightest disabled:text-neutral-dark"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-neutral-dark mb-1">
                    Alamat
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                      <MapPin size={18} className="text-neutral" />
                    </div>
                    <textarea
                      id="address"
                      name="address"
                      rows={3}
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="block w-full pl-10 pr-3 py-2 border border-neutral-light rounded-lg focus:ring-primary focus:border-primary disabled:bg-neutral-lightest disabled:text-neutral-dark"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="operating_hours" className="block text-sm font-medium text-neutral-dark mb-1">
                    Jam Operasional
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock size={18} className="text-neutral" />
                    </div>
                    <input
                      type="text"
                      id="operating_hours"
                      name="operating_hours"
                      value={formData.operating_hours}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="block w-full pl-10 pr-3 py-2 border border-neutral-light rounded-lg focus:ring-primary focus:border-primary disabled:bg-neutral-lightest disabled:text-neutral-dark"
                    />
                  </div>
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-neutral-darkest border-b border-neutral-light pb-2">Deskripsi & Rekening Bank</h3>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-neutral-dark mb-1">
                    Deskripsi Toko
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={5}
                    value={formData.description}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="block w-full px-3 py-2 border border-neutral-light rounded-lg focus:ring-primary focus:border-primary disabled:bg-neutral-lightest disabled:text-neutral-dark"
                  />
                </div>
                
                <div>
                  <label htmlFor="bank_name" className="block text-sm font-medium text-neutral-dark mb-1">
                    Nama Bank
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCard size={18} className="text-neutral" />
                    </div>
                    <input
                      type="text"
                      id="bank_name"
                      name="bank_name"
                      value={formData.bank_name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="block w-full pl-10 pr-3 py-2 border border-neutral-light rounded-lg focus:ring-primary focus:border-primary disabled:bg-neutral-lightest disabled:text-neutral-dark"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="account_number" className="block text-sm font-medium text-neutral-dark mb-1">
                    Nomor Rekening
                  </label>
                  <input
                    type="text"
                    id="account_number"
                    name="account_number"
                    value={formData.account_number}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="block w-full px-3 py-2 border border-neutral-light rounded-lg focus:ring-primary focus:border-primary disabled:bg-neutral-lightest disabled:text-neutral-dark"
                  />
                </div>
                
                <div>
                  <label htmlFor="account_name" className="block text-sm font-medium text-neutral-dark mb-1">
                    Atas Nama
                  </label>
                  <input
                    type="text"
                    id="account_name"
                    name="account_name"
                    value={formData.account_name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="block w-full px-3 py-2 border border-neutral-light rounded-lg focus:ring-primary focus:border-primary disabled:bg-neutral-lightest disabled:text-neutral-dark"
                  />
                </div>
                
                <div className="pt-4">
                  <h4 className="text-sm font-medium text-neutral-dark mb-2">Keamanan Akun</h4>
                  {isEditing ? (
                    <div className="space-y-3">
                      <button type="button" className="text-primary hover:text-primary-dark text-sm">
                        Ubah Kata Sandi
                      </button>
                    </div>
                  ) : (
                    <button type="button" className="text-primary hover:text-primary-dark text-sm">
                      Ubah Kata Sandi
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {isEditing && (
              <div className="mt-8 border-t border-neutral-light pt-4 flex justify-end">
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-neutral-light text-neutral-dark rounded-md hover:bg-neutral-lightest"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </ShopLayout>
  );
}