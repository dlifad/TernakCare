import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Users, LayoutDashboard, LogOut, Menu, X, UserCircle } from 'lucide-react';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, current: true },
    { name: 'User Management', href: '/admin/users', icon: Users, current: false },
  ];

  return (
    <div className="min-h-screen bg-neutral-lightest">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-neutral-darkest bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 bottom-0 w-64 bg-white shadow-card transform transition-transform duration-300 ease-in-out z-30 
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-light">
              <Link href="/" className="flex items-center">
                <img 
                  src="/api/placeholder/40/40" 
                  alt="Logo" 
                  className="h-8 w-8" 
                />
                <span className="ml-2 text-lg font-bold text-primary">TernakCare</span>
              </Link>
              <button 
                className="lg:hidden text-neutral-dark hover:text-neutral-darkest"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="px-2 py-4">
              <nav className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                      ${item.current 
                        ? 'bg-primary-light text-primary-dark' 
                        : 'text-neutral-dark hover:bg-neutral-light'
                      }
                    `}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          <div className="p-4 border-t border-neutral-light">
            <div className="flex items-center">
              <UserCircle size={32} className="text-neutral" />
              <div className="ml-3">
                <p className="text-sm font-medium text-neutral-darkest">Admin User</p>
                <Link 
                  href="/logout" 
                  method="post" 
                  as="button"
                  className="flex items-center text-xs text-neutral-dark hover:text-primary mt-1"
                >
                  <LogOut size={14} className="mr-1" />
                  Logout
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-10 bg-white shadow-soft h-16 flex items-center justify-between px-4 lg:px-8">
          <button
            className="lg:hidden text-neutral-dark hover:text-neutral-darkest"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex-1 lg:flex-initial"></div>
          
          <div className="flex items-center">
            <div className="ml-3 relative">
              <UserCircle size={32} className="text-neutral-dark cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="lg:pl-4">
          {children}
        </main>
      </div>
    </div>
  )};