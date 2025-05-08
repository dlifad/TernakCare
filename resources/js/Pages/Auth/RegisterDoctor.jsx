import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';
import Button from '@/Components/Common/Button';

export default function RegisterDoctor() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'doctor', // Role dokter hewan
        license_number: '',
        practice_address: '',
        phone_number: '',
        years_experience: '',
    });
    
    const handleSubmit = (e) => {
        e.preventDefault();
        post('/register/doctor');
    };
    
    return (
        <AuthLayout title="Daftar Sebagai Dokter Hewan">
            <div className="mb-6 text-center">
                <p className="text-neutral mt-2">Daftarkan diri Anda sebagai dokter hewan profesional</p>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Informasi Pribadi */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium text-neutral-dark mb-4">Informasi Pribadi</h3>
                    
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-neutral-dark mb-1">
                            Nama Lengkap
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full rounded-md shadow-sm border-neutral-light focus:border-primary focus:ring focus:ring-primary-light focus:ring-opacity-50"
                            required
                        />
                        {errors.name && (
                            <p className="text-xs text-danger mt-1">{errors.name}</p>
                        )}
                    </div>
                    
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-neutral-dark mb-1">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full rounded-md shadow-sm border-neutral-light focus:border-primary focus:ring focus:ring-primary-light focus:ring-opacity-50"
                            required
                        />
                        {errors.email && (
                            <p className="text-xs text-danger mt-1">{errors.email}</p>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="mb-4">
                            <label htmlFor="password" className="block text-sm font-medium text-neutral-dark mb-1">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full rounded-md shadow-sm border-neutral-light focus:border-primary focus:ring focus:ring-primary-light focus:ring-opacity-50"
                                required
                            />
                            {errors.password && (
                                <p className="text-xs text-danger mt-1">{errors.password}</p>
                            )}
                        </div>
                        
                        <div className="mb-4">
                            <label htmlFor="password_confirmation" className="block text-sm font-medium text-neutral-dark mb-1">
                                Konfirmasi Password
                            </label>
                            <input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className="w-full rounded-md shadow-sm border-neutral-light focus:border-primary focus:ring focus:ring-primary-light focus:ring-opacity-50"
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="mb-4">
                        <label htmlFor="phone_number" className="block text-sm font-medium text-neutral-dark mb-1">
                            Nomor Telepon
                        </label>
                        <input
                            id="phone_number"
                            type="tel"
                            value={data.phone_number}
                            onChange={(e) => setData('phone_number', e.target.value)}
                            className="w-full rounded-md shadow-sm border-neutral-light focus:border-primary focus:ring focus:ring-primary-light focus:ring-opacity-50"
                            required
                        />
                        {errors.phone_number && (
                            <p className="text-xs text-danger mt-1">{errors.phone_number}</p>
                        )}
                    </div>
                </div>
                
                {/* Informasi Profesional */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium text-neutral-dark mb-4">Informasi Profesional</h3>
                    
                    <div className="mb-4">
                        <label htmlFor="license_number" className="block text-sm font-medium text-neutral-dark mb-1">
                            Nomor Lisensi / SIP
                        </label>
                        <input
                            id="license_number"
                            type="text"
                            value={data.license_number}
                            onChange={(e) => setData('license_number', e.target.value)}
                            className="w-full rounded-md shadow-sm border-neutral-light focus:border-primary focus:ring focus:ring-primary-light focus:ring-opacity-50"
                            required
                        />
                        {errors.license_number && (
                            <p className="text-xs text-danger mt-1">{errors.license_number}</p>
                        )}
                    </div>
                    
                    <div className="mb-4">
                        <label htmlFor="years_experience" className="block text-sm font-medium text-neutral-dark mb-1">
                            Lama Pengalaman (Tahun)
                        </label>
                        <input
                            id="years_experience"
                            type="number"
                            min="0"
                            value={data.years_experience}
                            onChange={(e) => setData('years_experience', e.target.value)}
                            className="w-full rounded-md shadow-sm border-neutral-light focus:border-primary focus:ring focus:ring-primary-light focus:ring-opacity-50"
                            required
                        />
                        {errors.years_experience && (
                            <p className="text-xs text-danger mt-1">{errors.years_experience}</p>
                        )}
                    </div>
                    
                    <div className="mb-4">
                        <label htmlFor="practice_address" className="block text-sm font-medium text-neutral-dark mb-1">
                            Alamat Praktik
                        </label>
                        <textarea
                            id="practice_address"
                            value={data.practice_address}
                            onChange={(e) => setData('practice_address', e.target.value)}
                            className="w-full rounded-md shadow-sm border-neutral-light focus:border-primary focus:ring focus:ring-primary-light focus:ring-opacity-50"
                            rows="3"
                            required
                        ></textarea>
                        {errors.practice_address && (
                            <p className="text-xs text-danger mt-1">{errors.practice_address}</p>
                        )}
                    </div>
                </div>
                
                <Button
                    type="submit"
                    className="w-full"
                    disabled={processing}
                >
                    Daftar Sebagai Dokter Hewan
                </Button>
                
                <div className="mt-6 text-center">
                    <p className="text-sm text-neutral">
                        Sudah punya akun?{' '}
                        <Link
                            href={route('login')}
                            className="text-primary hover:text-primary-dark font-medium"
                        >
                            Masuk
                        </Link>
                    </p>
                </div>
                
                <div className="mt-6 text-center">
                    <p className="text-sm text-neutral">
                        Ingin mendaftar sebagai{' '}
                        <Link
                            href={route('register')}
                            className="text-primary hover:text-primary-dark font-medium"
                        >
                            Peternak
                        </Link>
                        {' '}atau{' '}
                        <Link
                            href={route('register.shop')}
                            className="text-primary hover:text-primary-dark font-medium"
                        >
                            Toko
                        </Link>
                        ?
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
}