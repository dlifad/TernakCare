import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';
import Button from '@/Components/Common/Button';

export default function RegisterShop() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'shop', // Role toko
        shop_name: '',
        shop_phone: '',
        shop_address: '',
        shop_description: '',
        owner_id_number: '',
    });
    
    const handleSubmit = (e) => {
        e.preventDefault();
        post('/register/shop');
    };
    
    return (
        <AuthLayout title="Daftar Sebagai Toko">
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-neutral-dark">Bergabung Sebagai Mitra Toko</h2>
                <p className="text-neutral mt-2">Perluas jangkauan penjualan produk peternakan Anda</p>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Informasi Pemilik */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium text-neutral-dark mb-4">Informasi Pemilik</h3>
                    
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-neutral-dark mb-1">
                            Nama Lengkap Pemilik
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
                        <label htmlFor="owner_id_number" className="block text-sm font-medium text-neutral-dark mb-1">
                            Nomor KTP Pemilik
                        </label>
                        <input
                            id="owner_id_number"
                            type="text"
                            value={data.owner_id_number}
                            onChange={(e) => setData('owner_id_number', e.target.value)}
                            className="w-full rounded-md shadow-sm border-neutral-light focus:border-primary focus:ring focus:ring-primary-light focus:ring-opacity-50"
                            required
                        />
                        {errors.owner_id_number && (
                            <p className="text-xs text-danger mt-1">{errors.owner_id_number}</p>
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
                </div>
                
                {/* Informasi Toko */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium text-neutral-dark mb-4">Informasi Toko</h3>
                    
                    <div className="mb-4">
                        <label htmlFor="shop_name" className="block text-sm font-medium text-neutral-dark mb-1">
                            Nama Toko
                        </label>
                        <input
                            id="shop_name"
                            type="text"
                            value={data.shop_name}
                            onChange={(e) => setData('shop_name', e.target.value)}
                            className="w-full rounded-md shadow-sm border-neutral-light focus:border-primary focus:ring focus:ring-primary-light focus:ring-opacity-50"
                            required
                        />
                        {errors.shop_name && (
                            <p className="text-xs text-danger mt-1">{errors.shop_name}</p>
                        )}
                    </div>
                    
                    <div className="mb-4">
                        <label htmlFor="shop_phone" className="block text-sm font-medium text-neutral-dark mb-1">
                            Nomor Telepon Toko
                        </label>
                        <input
                            id="shop_phone"
                            type="tel"
                            value={data.shop_phone}
                            onChange={(e) => setData('shop_phone', e.target.value)}
                            className="w-full rounded-md shadow-sm border-neutral-light focus:border-primary focus:ring focus:ring-primary-light focus:ring-opacity-50"
                            required
                        />
                        {errors.shop_phone && (
                            <p className="text-xs text-danger mt-1">{errors.shop_phone}</p>
                        )}
                    </div>
                    
                    <div className="mb-4">
                        <label htmlFor="shop_address" className="block text-sm font-medium text-neutral-dark mb-1">
                            Alamat Toko
                        </label>
                        <textarea
                            id="shop_address"
                            value={data.shop_address}
                            onChange={(e) => setData('shop_address', e.target.value)}
                            className="w-full rounded-md shadow-sm border-neutral-light focus:border-primary focus:ring focus:ring-primary-light focus:ring-opacity-50"
                            rows="3"
                            required
                        ></textarea>
                        {errors.shop_address && (
                            <p className="text-xs text-danger mt-1">{errors.shop_address}</p>
                        )}
                    </div>
                    
                    <div className="mb-4">
                        <label htmlFor="shop_description" className="block text-sm font-medium text-neutral-dark mb-1">
                            Deskripsi Toko
                        </label>
                        <textarea
                            id="shop_description"
                            value={data.shop_description}
                            onChange={(e) => setData('shop_description', e.target.value)}
                            className="w-full rounded-md shadow-sm border-neutral-light focus:border-primary focus:ring focus:ring-primary-light focus:ring-opacity-50"
                            rows="3"
                            placeholder="Jelaskan tentang toko Anda dan produk yang dijual"
                            required
                        ></textarea>
                        {errors.shop_description && (
                            <p className="text-xs text-danger mt-1">{errors.shop_description}</p>
                        )}
                    </div>
                    
  
                </div>
                
                <Button
                    type="submit"
                    className="w-full"
                    disabled={processing}
                >
                    Daftar Sebagai Toko
                </Button>
                
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
                            href={route('register.doctor')}
                            className="text-primary hover:text-primary-dark font-medium"
                        >
                            Dokter Hewan
                        </Link>
                        ?
                    </p>
                </div>
                
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
            </form>
        </AuthLayout>
    );
}