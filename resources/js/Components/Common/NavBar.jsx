// resources/js/Components/Common/NavBar.jsx
import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Menu, Bell, LogOut, Menu as MenuIcon } from 'lucide-react';

export default function NavBar({ openSidebar, userRole }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Sample notifications - would come from props or API
  const notifications = [
    { id: 1, message: 'Konsultasi dengan Dr. Andi telah dijadwalkan', time: '5 menit yang lalu', unread: true },
    { id: 2, message: 'Pesanan produk pakan ternak telah dikirim', time: '2 jam yang lalu', unread: false },
    { id: 3, message: 'Artikel baru tentang kesehatan ternak', time: '1 hari yang lalu', unread: false },
  ];
  
  return (
    <nav className="bg-white border-b border-neutral-light fixed w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center lg:hidden">
            <button
              onClick={openSidebar}
              className="text-neutral-dark hover:text-primary-dark focus:outline-none"
            >
              <MenuIcon size={24} />
            </button>
          </div>
          
          <div className="hidden lg:flex items-center">
            <span className="text-neutral-dark font-medium">Dashboard {userRole}</span>
          </div>
          
          <div className="flex items-center">
            {/* Notifications dropdown */}
            <div className="relative mr-4">
              <button 
                className="flex items-center text-neutral-dark hover:text-primary-dark focus:outline-none"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <span className="relative">
                  <Bell size={20} />
                  {notifications.some(n => n.unread) && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
                  )}
                </span>
              </button>
              
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-card py-1 z-20">
                  <div className="px-4 py-2 border-b border-neutral-light">
                    <h3 className="text-sm font-medium text-neutral-darkest">Notifikasi</h3>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`px-4 py-2 hover:bg-neutral-lightest ${notification.unread ? 'bg-primary-light/20' : ''}`}
                        >
                          <p className="text-sm text-neutral-darkest">{notification.message}</p>
                          <p className="text-xs text-neutral mt-1">{notification.time}</p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-4 text-center text-neutral">
                        Tidak ada notifikasi
                      </div>
                    )}
                  </div>
                  
                  <div className="px-4 py-2 border-t border-neutral-light">
                    <Link href="#" className="text-xs text-primary hover:text-primary-dark">
                      Lihat semua notifikasi
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* User dropdown */}
            <div className="relative">
              <button 
                className="flex items-center focus:outline-none"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <img 
                  src="/api/placeholder/32/32" 
                  alt="User Avatar" 
                  className="h-8 w-8 rounded-full object-cover border border-neutral-light"
                />
                <span className="ml-2 text-sm text-neutral-dark hidden md:block">Budi Santoso</span>
                <Menu className="ml-1 text-neutral-dark" size={16} />
              </button>
              
              {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-card py-1 z-50">
                <Link 
                  href={route('farmer.profile')}
                  className="block px-4 py-2 text-sm text-neutral-darkest hover:bg-neutral-lightest"
                >
                  Profil Saya
                </Link>
                <Link 
                  href={route('logout')} 
                  method="post" 
                  as="button" 
                  className="w-full text-left block px-4 py-2 text-sm text-neutral-darkest hover:bg-neutral-lightest"
                >
                  <div className="flex items-center">
                    <LogOut size={16} className="mr-2" />
                    Keluar
                  </div>
                </Link>
              </div>
            )}

            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}