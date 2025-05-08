import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';
import Button from '@/Components/Common/Button';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'farmer', // Role default adalah peternak
    });
    
    const handleSubmit = (e) => {
        e.preventDefault();
        post('/register');
    };
    
    return (
        <AuthLayout title="Buat Akun Peternak">
            <form onSubmit={handleSubmit}>
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
                
                <div className="mb-6">
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
                
                <Button
                    type="submit"
                    className="w-full"
                    disabled={processing}
                >
                    Daftar Sebagai Peternak
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
                
                {/* Section untuk tipe pengguna lain */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-neutral">
                        Ingin mendaftar sebagai{' '}
                        <Link
                            href={route('register.doctor')}
                            className="text-primary hover:text-primary-dark font-medium"
                        >
                            Dokter Hewan
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