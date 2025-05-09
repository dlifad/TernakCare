import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card } from '@/Components/Common/Card';
import { Modal } from '@/Components/Common/Modal';
import { Alert } from '@/Components/Common/Alert';

const VerificationCard = ({ item, onApprove, onReject }) => {
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [reason, setReason] = useState('');

    const handleReject = () => {
        onReject(item.id, reason);
        setShowRejectModal(false);
        setReason('');
    };

    return (
        <Card className="mb-4">
            <div className="p-4">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-600">Email: {item.email}</p>
                
                {item.type === 'doctor' && (
                    <>
                        <p className="text-sm text-gray-600">No. Telp: {item.phone_number}</p>
                        <p className="text-sm text-gray-600">No. Lisensi: {item.license_number}</p>
                        <p className="text-sm text-gray-600">Alamat Praktik: {item.practice_address}</p>
                        <p className="text-sm text-gray-600">Pengalaman: {item.years_experience} tahun</p>
                    </>
                )}
                
                {item.type === 'shop' && (
                    <>
                        <p className="text-sm text-gray-600">Nama Toko: {item.shop_name}</p>
                        <p className="text-sm text-gray-600">No. Telp Toko: {item.shop_phone}</p>
                        <p className="text-sm text-gray-600">Alamat Toko: {item.shop_address}</p>
                        <p className="text-sm text-gray-600">No. Identitas Pemilik: {item.owner_id_number}</p>
                        <p className="text-sm text-gray-600">Deskripsi: {item.shop_description.substring(0, 100)}...</p>
                    </>
                )}
                
                <div className="flex space-x-2 mt-4">
                    <button 
                        onClick={() => onApprove(item.id)}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Setujui
                    </button>
                    <button 
                        onClick={() => setShowRejectModal(true)}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Tolak
                    </button>
                </div>
            </div>
            
            {/* Modal Penolakan */}
            {showRejectModal && (
                <Modal
                    isOpen={showRejectModal}
                    onClose={() => setShowRejectModal(false)}
                    title={`Tolak Pendaftaran ${item.type === 'doctor' ? 'Dokter' : 'Toko'}`}
                >
                    <div className="p-4">
                        <label className="block mb-2">
                            Alasan Penolakan:
                            <textarea 
                                className="w-full border rounded p-2 mt-1" 
                                rows="4"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                            />
                        </label>
                        <div className="flex justify-end space-x-2 mt-4">
                            <button 
                                onClick={() => setShowRejectModal(false)}
                                className="px-4 py-2 bg-gray-300 rounded"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={handleReject}
                                className="px-4 py-2 bg-red-500 text-white rounded"
                                disabled={!reason.trim()}
                            >
                                Tolak
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </Card>
    );
};

export default function VerificationIndex({ pendingDoctors, pendingShops, flash }) {
    const { post, processing } = useForm();
    
    const handleApproveDoctor = (id) => {
        post(route('admin.verification.approve.doctor', id));
    };
    
    const handleRejectDoctor = (id, reason) => {
        post(route('admin.verification.reject.doctor', id), { reason });
    };
    
    const handleApproveShop = (id) => {
        post(route('admin.verification.approve.shop', id));
    };
    
    const handleRejectShop = (id, reason) => {
        post(route('admin.verification.reject.shop', id), { reason });
    };
    
    return (
        <AdminLayout>
            <Head title="Verifikasi Pendaftaran" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {flash.message && (
                        <Alert type="success" message={flash.message} className="mb-4" />
                    )}
                    
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h2 className="text-2xl font-semibold mb-6">Verifikasi Pendaftaran</h2>
                            
                            {pendingDoctors.length === 0 && pendingShops.length === 0 && (
                                <p className="text-gray-500">Tidak ada pendaftaran yang menunggu verifikasi.</p>
                            )}
                            
                            {pendingDoctors.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-xl font-medium mb-4">Dokter Menunggu Verifikasi ({pendingDoctors.length})</h3>
                                    {pendingDoctors.map((doctor) => (
                                        <VerificationCard 
                                            key={doctor.id}
                                            item={doctor}
                                            onApprove={handleApproveDoctor}
                                            onReject={handleRejectDoctor}
                                        />
                                    ))}
                                </div>
                            )}
                            
                            {pendingShops.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-medium mb-4">Toko Menunggu Verifikasi ({pendingShops.length})</h3>
                                    {pendingShops.map((shop) => (
                                        <VerificationCard 
                                            key={shop.id}
                                            item={shop}
                                            onApprove={handleApproveShop}
                                            onReject={handleRejectShop}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}