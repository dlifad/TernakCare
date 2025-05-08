import React, { useState } from 'react';
import { Link } from '@inertiajs/react';

export default function Sidebar({ user, items }) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    
    return (
        <>
            {/* Mobile sidebar toggle */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="p-2 rounded-md bg-primary text-white shadow-md"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
            
            {/* Sidebar for mobile */}
            <div className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-neutral-dark opacity-50" onClick={() => setIsMobileOpen(false)}></div>
                
                <div className="relative bg-white w-64 max-w-xs h-full overflow-y-auto shadow-xl">
                    <div className="pt-5 pb-6 px-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <img className="h-8 w-auto" src="/images/logo.png" alt="TernakCare" />
                            </div>
                            <div>
                                <button
                                    onClick={() => setIsMobileOpen(false)}
                                    className="p-2 text-neutral-dark rounded-md hover:bg-neutral-lightest focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                >
                                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        
                        <div className="mt-6">
                            <UserInfo user={user} />
                            <nav className="mt-6">
                                <div className="space-y-1">
                                    {items.map((item, index) => (
                                        <SidebarItem 
                                            key={index} 
                                            href={item.href} 
                                            icon={item.icon} 
                                            text={item.text} 
                                            active={item.active} 
                                            onClick={() => setIsMobileOpen(false)}
                                        />
                                    ))}
                                </div>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Sidebar for desktop */}
            <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0">
                <div className="flex flex-col flex-grow bg-white shadow-xl overflow-y-auto">
                    <div className="flex items-center justify-center h-16 flex-shrink-0 px-4 bg-primary">
                        <img className="h-8 w-auto" src="/images/logo-white.png" alt="TernakCare" />
                    </div>
                    
                    <div className="flex-grow flex flex-col">
                        <div className="p-4">
                            <UserInfo user={user} />
                        </div>
                        <nav className="flex-1 px-4 pb-4">
                            <div className="space-y-1">
                                {items.map((item, index) => (
                                    <SidebarItem 
                                        key={index} 
                                        href={item.href} 
                                        icon={item.icon} 
                                        text={item.text} 
                                        active={item.active} 
                                    />
                                ))}
                            </div>
                        </nav>
                    </div>
                </div>
            </div>
        </>
    );
}

function UserInfo({ user }) {
    return (
        <div className="flex items-center space-x-3 p-3 bg-neutral-lightest rounded-lg">
            <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-white font-semibold">
                    {user.name.substring(0, 1).toUpperCase()}
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-darkest truncate">
                    {user.name}
                </p>
                <p className="text-xs text-neutral capitalize">
                    {user.role}
                </p>
            </div>
        </div>
    );
}

function SidebarItem({ href, icon, text, active, onClick }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                active
                    ? 'bg-primary-light text-primary-dark'
                    : 'text-neutral-dark hover:bg-neutral-lightest hover:text-primary'
            }`}
        >
            <span className="mr-3 h-5 w-5">{icon}</span>
            {text}
        </Link>
    );
}