// Simpan ke resources/js/Pages/Auth/AwaitingVerification.jsx jika menggunakan React
// atau resources/js/Pages/Auth/AwaitingVerification.vue jika menggunakan Vue

// Versi React (JSX)
import React from 'react';
import { Head, Link } from "@inertiajs/react";
import AuthLayout from '@/Layouts/AuthLayout';

export default function AwaitingVerification({ userType }) {
    return (
        <AuthLayout>
            <Head title="Pendaftaran Dokter Berhasil" />

            <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md text-center">
                <svg 
                    className="w-16 h-16 mx-auto mb-4" 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="44" 
                    height="44" 
                    viewBox="0 0 24 24" 
                    strokeWidth="1.5" 
                    stroke="#2c3e50" 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5" />
                    <path d="M12 12l8 -4.5" />
                    <path d="M12 12l0 9" />
                    <path d="M12 12l-8 -4.5" />
                </svg>

                <h2 className="text-2xl font-semibold mb-2">Pendaftaran {userType === 'doctor' ? 'Dokter' : 'Toko'} Berhasil</h2>
                
                <p className="text-gray-600 mb-6">
                    Terima kasih atas pendaftaran Anda. Akun {userType === 'doctor' ? 'Dokter' : 'Toko'} Anda sedang
                    menunggu verifikasi oleh admin.
                </p>
                
                <p className="text-gray-600 mb-6">
                    Kami akan mengirimkan email notifikasi ke alamat email terdaftar ketika akun Anda telah diverifikasi.
                </p>

                <div className="mt-4">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                    >
                        Kembali ke Halaman Login
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}