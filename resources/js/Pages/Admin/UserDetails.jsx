import React from 'react';
import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function UserDetails({ user }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-success bg-opacity-10 text-success">
        Aktif
      </span>
    ) : (
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-danger bg-opacity-10 text-danger">
        Nonaktif
      </span>
    );
  };

  const getApprovalStatusBadge = (isApproved) => {
    return isApproved ? (
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-success bg-opacity-10 text-success">
        Disetujui
      </span>
    ) : (
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-warning bg-opacity-10 text-warning">
        Menunggu Persetujuan
      </span>
    );
  };

  const getRoleName = (role) => {
    switch (role) {
      case 'doctor': return 'Dokter';
      case 'shop': return 'Toko';
      case 'farmer': return 'Petani';
      default: return 'Pengguna';
    }
  };

  const handleChangeStatus = (action) => {
    let url;

    switch (action) {
      case 'suspend':
        url = route('admin.users.suspend');
        break;
      case 'activate':
        url = route('admin.users.activate');
        break;
      default:
        return;
    }

    router.post(url, { userId: user.id }, {
      onSuccess: () => {
        router.visit(route('admin.dashboard'));
      }
    });
  };

  const handleBack = () => {
    router.visit(route('admin.dashboard'));
  };

  return (
    <AdminLayout>
      <Head title={`Detail ${getRoleName(user.role)} - ${user.name}`} />
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-heading font-semibold text-neutral-darkest">
              Detail {getRoleName(user.role)}
            </h1>
            <button
              onClick={handleBack}
              className="rounded-md bg-neutral-light px-4 py-2 text-sm font-medium text-neutral-dark hover:bg-neutral-light/80"
            >
              Kembali ke Dashboard
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-neutral-darkest mb-4">Informasi Dasar</h2>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-neutral-dark">Nama</div>
                      <div className="text-base text-neutral-darkest">{user.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-neutral-dark">Email</div>
                      <div className="text-base text-neutral-darkest">{user.email}</div>
                    </div>
                    <div>
                      <div className="text-sm text-neutral-dark">Telepon</div>
                      <div className="text-base text-neutral-darkest">{user.phone || '-'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-neutral-dark">Alamat</div>
                      <div className="text-base text-neutral-darkest">{user.address || '-'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-neutral-dark">Role</div>
                      <div className="text-base text-neutral-darkest">{getRoleName(user.role)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-neutral-dark">Terdaftar Pada</div>
                      <div className="text-base text-neutral-darkest">{formatDate(user.created_at)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-neutral-dark">Status</div>
                      <div className="mt-1">{getStatusBadge(user.is_active)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-neutral-dark">Status Persetujuan</div>
                      <div className="mt-1">{getApprovalStatusBadge(user.is_approved)}</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-neutral-darkest mb-4">Aksi</h2>
                  <div className="flex space-x-2">
                    {user.is_active ? (
                      <button
                        onClick={() => handleChangeStatus('suspend')}
                        className="rounded-md bg-danger bg-opacity-10 px-4 py-2 text-sm font-medium text-danger hover:bg-danger hover:bg-opacity-20"
                      >
                        Nonaktifkan Pengguna
                      </button>
                    ) : (
                      <button
                        onClick={() => handleChangeStatus('activate')}
                        className="rounded-md bg-success bg-opacity-10 px-4 py-2 text-sm font-medium text-success hover:bg-success hover:bg-opacity-20"
                      >
                        Aktifkan Pengguna
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                {user.details && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-neutral-darkest mb-4">
                      Detail {getRoleName(user.role)}
                    </h2>
                    <div className="space-y-3">
                      {user.role === 'doctor' && (
                        <>
                          <div>
                            <div className="text-sm text-neutral-dark">Spesialisasi</div>
                            <div className="text-base text-neutral-darkest">{user.details.specialty || '-'}</div>
                          </div>
                          <div>
                            <div className="text-sm text-neutral-dark">Nomor Lisensi</div>
                            <div className="text-base text-neutral-darkest">{user.details.license_number || '-'}</div>
                          </div>
                          <div>
                            <div className="text-sm text-neutral-dark">Bio</div>
                            <div className="text-base text-neutral-darkest">{user.details.bio || '-'}</div>
                          </div>
                          {user.consultations !== undefined && (
                            <div>
                              <div className="text-sm text-neutral-dark">Jumlah Konsultasi</div>
                              <div className="text-base text-neutral-darkest">{user.consultations}</div>
                            </div>
                          )}
                        </>
                      )}
                      
                      {user.role === 'shop' && (
                        <>
                          <div>
                            <div className="text-sm text-neutral-dark">Nama Toko</div>
                            <div className="text-base text-neutral-darkest">{user.details.shop_name || '-'}</div>
                          </div>
                          <div>
                            <div className="text-sm text-neutral-dark">Deskripsi</div>
                            <div className="text-base text-neutral-darkest">{user.details.description || '-'}</div>
                          </div>
                          {user.products !== undefined && (
                            <div>
                              <div className="text-sm text-neutral-dark">Jumlah Produk</div>
                              <div className="text-base text-neutral-darkest">{user.products}</div>
                            </div>
                          )}
                          {user.transactions !== undefined && (
                            <div>
                              <div className="text-sm text-neutral-dark">Jumlah Transaksi</div>
                              <div className="text-base text-neutral-darkest">{user.transactions}</div>
                            </div>
                          )}
                        </>
                      )}
                      
                      {user.role === 'farmer' && (
                        <>
                          <div>
                            <div className="text-sm text-neutral-dark">Nama Peternakan</div>
                            <div className="text-base text-neutral-darkest">{user.details.farm_name || '-'}</div>
                          </div>
                          <div>
                            <div className="text-sm text-neutral-dark">Ukuran Peternakan</div>
                            <div className="text-base text-neutral-darkest">{user.details.farm_size || '-'}</div>
                          </div>
                          <div>
                            <div className="text-sm text-neutral-dark">Jenis Ternak</div>
                            <div className="text-base text-neutral-darkest">{user.details.livestock_type || '-'}</div>
                          </div>
                          {user.consultations !== undefined && (
                            <div>
                              <div className="text-sm text-neutral-dark">Jumlah Konsultasi</div>
                              <div className="text-base text-neutral-darkest">{user.consultations}</div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
                
                {user.details && user.details.rejection_reason && (
                  <div className="mt-6 bg-danger bg-opacity-5 p-4 rounded-md">
                    <h3 className="text-md font-medium text-danger mb-2">Alasan Penolakan</h3>
                    <p className="text-sm text-neutral-dark">{user.details.rejection_reason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}