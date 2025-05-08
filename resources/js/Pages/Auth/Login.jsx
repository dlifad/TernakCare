import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';
import Button from '@/Components/Common/Button';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });
    
    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login');
    };
    
    return (
        <AuthLayout title="Masuk ke Akun Anda">
            <form onSubmit={handleSubmit}>
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
                
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <input
                            id="remember"
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded border-neutral-light text-primary focus:ring-primary-light"
                        />
                        <label htmlFor="remember" className="ml-2 block text-sm text-neutral-dark">
                            Ingat saya
                        </label>
                    </div>
                    
                    <div>
                        <Link
                            href="/forgot-password"
                            className="text-sm text-primary hover:text-primary-dark"
                        >
                            Lupa password?
                        </Link>
                    </div>
                </div>
                
                <Button
                    type="submit"
                    className="w-full"
                    disabled={processing}
                >
                    Masuk
                </Button>
                
                <div className="mt-6 text-center">
                    <p className="text-sm text-neutral">
                        Belum punya akun?{' '}
                        <Link
                            href="/register"
                            className="text-primary hover:text-primary-dark font-medium"
                        >
                            Daftar
                        </Link>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
}