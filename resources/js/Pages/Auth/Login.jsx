import React, { useEffect } from 'react';
import { Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/Layouts/AuthLayout';
import Button from '@/Components/Common/Button';

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });
    
    // Reset password field on component unmount
    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);
    
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('login'));
    };
    
    // Display any flash messages or login errors at the top of the form
    const renderFlashMessages = () => {

        if (status) {
            return (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    {status}
                </div>
            );
        }
        
        // If there are login errors (from AuthController)
        if (errors.email || errors.password || errors.general) {
            return (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {errors.email || errors.password || errors.general}
                </div>
            );
        }
        
        return null;
    };
    
    return (
        <AuthLayout title="Masuk ke Akun Anda">
            {renderFlashMessages()}
            
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
                        className={`w-full rounded-md shadow-sm border-neutral-light focus:border-primary focus:ring focus:ring-primary-light focus:ring-opacity-50 ${
                            errors.email ? 'border-red-500' : ''
                        }`}
                        required
                        autoFocus
                    />
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
                        className={`w-full rounded-md shadow-sm border-neutral-light focus:border-primary focus:ring focus:ring-primary-light focus:ring-opacity-50 ${
                            errors.password ? 'border-red-500' : ''
                        }`}
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
                            href={route('password.request')}
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
                    {processing ? 'Memproses...' : 'Masuk'}
                </Button>
                
                <div className="mt-6 text-center">
                    <p className="text-sm text-neutral">
                        Belum punya akun?{' '}
                        <Link
                            href={route('register')}
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