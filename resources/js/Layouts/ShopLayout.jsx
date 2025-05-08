import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import Sidebar from '@/Components/Common/Sidebar';
import NavBar from '@/Components/Common/NavBar';

export default function ShopLayout({ children, title }) {
    const { auth } = usePage().props;
    
    const sidebarItems = [
        {
            href: '/shop/products',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            ),
            text: 'Kelola Produk',
            active: window.location.pathname === '/shop/products',
        },
        {
            href: '/shop/transactions',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ),
            text: 'Daftar Pemesanan',
            active: window.location.pathname === '/shop/transactions',
        },
        {
            href: '/shop/history',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            text: 'Riwayat Transaksi',
            active: window.location.pathname === '/shop/history',
        },
        {
            href: '/shop/profile',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            text: 'Profil',
            active: window.location.pathname === '/shop/profile',
        },
    ];
    
    return (
        <div className="min-h-screen bg-neutral-lightest">
            <Head title={title} />
            
            <Sidebar user={auth.user} items={sidebarItems} />
            
            <div className="md:pl-64">
                <NavBar user={auth.user} />
                
                <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-semibold text-neutral-darkest">{title}</h1>
                    </div>
                    
                    {children}
                </main>
            </div>
        </div>
    );
}