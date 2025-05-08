import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
  Home, 
  PhoneCall, 
  ShoppingBag, 
  BookOpen, 
  User, 
  Menu, 
  X, 
  Bell, 
  LogOut 
} from 'lucide-react';
import NavBar from '@/Components/Common/NavBar';
import Footer from '@/Components/Common/Footer';

export default function FarmerLayout({ user, children }) {
  const { url } = usePage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false); 

  const navigationItems = [
    { name: 'Beranda', href: route('farmer.home'), icon: Home, current: url === route('farmer.home') },
    { name: 'Panggil Dokter', href: route('farmer.consultations.index'), icon: PhoneCall, current: url.startsWith(route('farmer.consultations.index')) },
    { name: 'Pasar Ternak', href: route('farmer.marketplace'), icon: ShoppingBag, current: url.startsWith(route('farmer.marketplace')) },
    { name: 'Info Ternak', href: route('farmer.articles'), icon: BookOpen, current: url.startsWith(route('farmer.articles')) },
    // { name: 'Profil', href: route('farmer.profile.edit'), icon: User, current: url.startsWith(route('farmer.profile.edit')) },
  ];

  const notifications = [
    { id: 1, text: 'Konsultasi Disetujui - Dokter Ani', time: '30 menit yang lalu', read: false },
    { id: 2, text: 'Pesanan #12345 sedang dalam perjalanan', time: '2 jam yang lalu', read: false },
    { id: 3, text: 'Artikel baru telah ditambahkan', time: '1 hari yang lalu', read: true },
  ];

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-neutral-lightest flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white shadow-soft sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <Link href={route('farmer.home')} className="flex items-center">
                {/* <img 
                  className="h-10 w-auto" 
                  src="/storage/images/logo.png" 
                  alt="Farming App Logo" 
                /> */}
                <span className="ml-2 text-xl font-heading font-bold text-primary">TernakCare</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition duration-150 ease-in-out ${
                    item.current 
                      ? 'text-primary bg-primary-light' 
                      : 'text-neutral-dark hover:text-primary hover:bg-primary-light/30'
                  }`}
                >
                  <item.icon className="mr-1.5 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right Side - Notifications & Profile */}
            <div className="flex items-center">
              {/* Notifications */}
              <div className="relative ml-3">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-1 rounded-full text-neutral-dark hover:text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary relative"
                >
                  <Bell className="h-6 w-6" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                  )}
                </button>
                
                {/* Notification Panel */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-2 divide-y divide-neutral-lightest">
                      <div className="px-4 py-2 flex justify-between items-center">
                        <h3 className="text-sm font-medium text-neutral-darkest">Notifikasi</h3>
                        <button className="text-xs text-primary hover:text-primary-dark">
                          Tandai semua dibaca
                        </button>
                      </div>
                      {notifications.length > 0 ? (
                        <div className="max-h-64 overflow-y-auto">
                          {notifications.map((notification) => (
                            <Link
                              key={notification.id}
                              href="#"
                              className={`block px-4 py-2 hover:bg-neutral-lightest ${
                                notification.read ? 'opacity-70' : ''
                              }`}
                            >
                              <p className="text-sm text-neutral-darkest">{notification.text}</p>
                              <p className="text-xs text-neutral mt-1">{notification.time}</p>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="px-4 py-3 text-sm text-neutral text-center">
                          Tidak ada notifikasi baru
                        </div>
                      )}
                      <div className="px-4 py-2 text-center">
                        <Link
                          href="#"
                          className="text-xs text-primary hover:text-primary-dark font-medium"
                        >
                          Lihat semua notifikasi
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile dropdown */}
              <div className="relative ml-3">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center focus:outline-none"
                >
                  <img 
                    className="h-8 w-8 rounded-full object-cover border border-neutral-light" 
                    src={user?.profile_photo_url || '/storage/images/default-avatar.png'} 
                    alt="Profile"
                  />
                  <span className="ml-2 text-sm font-medium text-neutral-darkest hidden sm:block">
                    {user?.name}
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-card py-1 z-20">
                    <Link 
                      href={route('farmer.profile')}
                      className="block px-4 py-2 text-sm text-neutral-darkest hover:bg-neutral-lightest"
                    >
                      <div className="flex items-center">
                        <User size={16} className="mr-2" />
                        Profil
                      </div>
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


              {/* Mobile menu button */}
              <div className="ml-3 md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-neutral-dark hover:text-primary hover:bg-neutral-lightest focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                >
                  <span className="sr-only">Open main menu</span>
                  {mobileMenuOpen ? (
                    <X className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Menu className="block h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${
                    item.current
                      ? 'text-primary bg-primary-light'
                      : 'text-neutral-dark hover:text-primary hover:bg-primary-light/30'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
              <Link
                href={route('logout')}
                method="post"
                as="button"
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium flex items-center text-neutral-dark hover:text-danger hover:bg-danger/10"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Keluar
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}