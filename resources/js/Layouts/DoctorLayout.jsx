import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import Sidebar from '@/Components/Common/Sidebar';
import NavBar from '@/Components/Common/NavBar';

export default function DoctorLayout({ children, title }) {
    const { auth } = usePage().props;
    
    const sidebarItems = [
        {
            href: '/doctor/dashboard',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
            text: 'Dashboard',
            active: window.location.pathname === '/doctor/dashboard',
        },
        {
            href: '/doctor/consultation-requests',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8" />
                </svg>
            ),
            text: 'Permintaan Konsultasi',
            active: window.location.pathname === '/doctor/consultation-requests',
        },
        {
            href: '/doctor/history',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            text: 'Riwayat Konsultasi',
            active: window.location.pathname === '/doctor/history',
        },
        {
            href: '/doctor/profile',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            text: 'Profil',
            active: window.location.pathname === '/doctor/profile',
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