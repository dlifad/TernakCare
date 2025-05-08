import { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import FarmerLayout from '@/Layouts/FarmerLayout';
import Button from '@/Components/Common/Button';
import Card from '@/Components/Common/Card';
import Alert from '@/Components/Common/Alert';

export default function Profile({ auth }) {
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
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
  const [passwordForm, setPasswordForm] = useState({
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

  // Universal handler input text
  const handleInputChange = (e) => {
    setData(e.target.id, e.target.value);
  };

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

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.id]: e.target.value,
    });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordLoading(true);

    // Gunakan Inertia visit biar data post password dipisah
    window.axios.post(route('farmer.profile.update-password'), passwordForm)
      .then(() => {
        setSuccessMessage('Password berhasil diperbarui');
        setTimeout(() => setSuccessMessage(''), 3000);
        setPasswordForm({
          current_password: '',
          new_password: '',
          new_password_confirmation: '',
        });
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setPasswordLoading(false);
      });
  };

  return (
    <FarmerLayout>
      <Head title="Profil Peternak" />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-heading font-bold text-neutral-darkest mb-6">Profil Saya</h1>

          {successMessage && (
            <Alert type="success" message={successMessage} className="mb-6" />
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {/* Profile Photo */}
            <Card className="md:col-span-1">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 mb-4 relative">
                  <img
                    src={photoPreview || data.photo_url}
                    alt="Foto Profil"
                    className="w-full h-full object-cover rounded-full border-4 border-primary"
                  />
                  {isEditing && (
                    <div className="absolute bottom-0 right-0">
                      <label htmlFor="photo-upload" className="bg-primary hover:bg-primary-dark text-white p-2 rounded-full cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-camera">
                          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                          <circle cx="12" cy="13" r="3" />
                        </svg>
                        <input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoChange}
                        />
                      </label>
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-neutral-dark">{data.name}</h2>
                <p className="text-neutral mb-2">{data.farm_name}</p>

                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)} className="mt-4 w-full" variant="outline">
                    Edit Profil
                  </Button>
                )}
              </div>
            </Card>

            {/* Profile Details */}
            <Card className="md:col-span-2">
              <h3 className="text-xl font-semibold mb-4 text-neutral-dark border-b pb-2">
                {isEditing ? 'Edit Informasi Profil' : 'Informasi Profil'}
              </h3>

              <form onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { id: 'name', label: 'Nama Lengkap', type: 'text' },
                    { id: 'email', label: 'Email', type: 'email' },
                    { id: 'phone', label: 'Nomor Telepon', type: 'text' },
                  ].map((field) => (
                    <div key={field.id} className="space-y-2">
                      <label htmlFor={field.id} className="block text-sm font-medium text-neutral-dark">{field.label}</label>
                      <input
                        id={field.id}
                        type={field.type}
                        value={data[field.id]}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-neutral-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-neutral-lightest disabled:text-neutral-dark"
                      />
                      {errors[field.id] && <p className="text-sm text-danger">{errors[field.id]}</p>}
                    </div>
                  ))}

                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-neutral-dark">Alamat</label>
                    <textarea
                      id="address"
                      rows={3}
                      value={data.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-neutral-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-neutral-lightest disabled:text-neutral-dark"
                    />
                    {errors.address && <p className="text-sm text-danger">{errors.address}</p>}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-3 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setPhotoPreview(null);
                        // Reset hanya photo + isEditing
                        setData((prev) => ({
                          ...prev,
                          photo: null,
                        }));
                      }}
                    >
                      Batal
                    </Button>
                    <Button type="submit" disabled={processing}>
                      {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </Button>
                  </div>
                )}
              </form>
            </Card>

            {/* Password Change */}
            <Card className="md:col-span-3">
              <h3 className="text-xl font-semibold mb-4 text-neutral-dark border-b pb-2">
                Ubah Password
              </h3>

              <form onSubmit={handlePasswordSubmit}>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { id: 'current_password', label: 'Password Saat Ini' },
                    { id: 'new_password', label: 'Password Baru' },
                    { id: 'new_password_confirmation', label: 'Konfirmasi Password Baru' },
                  ].map((field) => (
                    <div key={field.id} className="space-y-2">
                      <label htmlFor={field.id} className="block text-sm font-medium text-neutral-dark">{field.label}</label>
                      <input
                        id={field.id}
                        type="password"
                        value={passwordForm[field.id]}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 border border-neutral-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      {errors[field.id] && <p className="text-sm text-danger">{errors[field.id]}</p>}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mt-4">
                  <Button type="submit" className="px-6" disabled={passwordLoading}>
                    {passwordLoading ? 'Memproses...' : 'Perbarui Password'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </FarmerLayout>
  );
}
