import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function AuthLayout({ children, title }) {
    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center bg-neutral-lightest">
            <Head title={title} />
            
            <div className="mb-6">
                <Link href="/">
                    <div className="font-bold text-2xl text-primary">TernakCare</div>
                </Link>
            </div>
            
            <div className="w-full sm:max-w-md px-6 py-8 bg-white shadow-card overflow-hidden rounded-lg">
                <h1 className="text-xl font-semibold text-neutral-darkest text-center mb-6">{title}</h1>
                
                {children}
            </div>
        </div>
    );
}