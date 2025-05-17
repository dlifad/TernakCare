import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    Home,
    PhoneCall,
    ShoppingBag,
    BookOpen,
    User,
    Menu,
    X,
    Bell,
    LogOut,
} from "lucide-react";
import NavBar from "@/Components/Common/NavBar";
import Footer from "@/Components/Common/Footer";
import CartButton from "@/Components/Farmer/CartButton";

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

const NavigationItem = ({ item, onClick }) => (
    <Link
        href={item.href}
        onClick={onClick}
        className={classNames(
            "flex items-center px-3 py-2 rounded-md font-medium transition duration-150 ease-in-out",
            item.current
                ? "text-primary bg-primary-light"
                : "text-neutral-dark hover:text-primary hover:bg-primary-light/30",
            item.mobile ? "text-base" : "text-sm"
        )}
    >
        <item.icon className="mr-1.5 h-5 w-5" />
        {item.name}
    </Link>
);

const NotificationPanel = ({ notifications, onClose }) => {
    const unread = notifications.filter((n) => !n.read).length;

    return (
        <div className="relative ml-3">
            <button
                onClick={onClose}
                className="p-1 rounded-full text-neutral-dark hover:text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary relative"
            >
                <Bell className="h-6 w-6" />
                {unread > 0 && (
                    <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                )}
            </button>
            <div className="absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-2 divide-y divide-neutral-lightest">
                    <div className="px-4 py-2 flex justify-between items-center">
                        <h3 className="text-sm font-medium text-neutral-darkest">
                            Notifikasi
                        </h3>
                        <button className="text-xs text-primary hover:text-primary-dark">
                            Tandai semua dibaca
                        </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map((n) => (
                                <Link
                                    key={n.id}
                                    href="#"
                                    className={classNames(
                                        "block px-4 py-2 hover:bg-neutral-lightest",
                                        n.read && "opacity-70"
                                    )}
                                >
                                    <p className="text-sm text-neutral-darkest">
                                        {n.text}
                                    </p>
                                    <p className="text-xs text-neutral mt-1">
                                        {n.time}
                                    </p>
                                </Link>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-sm text-neutral text-center">
                                Tidak ada notifikasi baru
                            </div>
                        )}
                    </div>
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
        </div>
    );
};

const ProfileDropdown = ({ user, dropdownOpen, toggleDropdown }) => {
    const getPhotoUrl = () => {
        if (
            user?.photo_url &&
            user.photo_url !== "undefined" &&
            user.photo_url !== "null"
        ) {
            return user.photo_url.startsWith("http")
                ? user.photo_url
                : `/storage/${user.photo_url}`;
        }
        if (
            user?.photo_path &&
            user.photo_path !== "undefined" &&
            user.photo_path !== "null"
        ) {
            return `/storage/${user.photo_path}`;
        }
        return "/storage/assets/default-avatar.png";
    };

    return (
        <div className="relative ml-3">
            <button onClick={toggleDropdown} className="flex items-center">
                <div className="w-8 h-8 bg-primary-light text-primary border-2 border-white rounded-full overflow-hidden">
                    <img
                        src={getPhotoUrl()}
                        alt="Foto Profil"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/storage/assets/default-avatar.png";
                        }}
                    />
                </div>
                <span className="ml-2 text-sm font-medium text-neutral-darkest hidden sm:block">
                    {user?.name}
                </span>
            </button>
                {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-card py-1 z-20">
                        <Link
                            href={route("farmer.profile")}
                            className="flex items-center px-4 py-2 text-sm text-neutral-darkest hover:bg-neutral-lightest"
                        >
                            <User size={16} className="mr-2" />
                            Profil
                        </Link>
                        <Link
                            href={route("logout")}
                            method="post"
                            as="button"
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-neutral-darkest hover:bg-neutral-lightest"
                        >
                            <LogOut size={16} className="mr-2" />
                            Keluar
                        </Link>
                    </div>
                )}
        </div>
    );
};

export default function FarmerLayout({ user, children, cartCount }) {
    const { url } = usePage();
    // Mengambil data cartCount dari props Inertia (shared data)
    const { cartCount: sharedCartCount } = usePage().props;
    
    // Menggunakan prioritas:
    // 1. Jika cartCount dari props komponen tersedia, gunakan itu (untuk halaman Cart)
    // 2. Jika tidak, gunakan cartCount dari shared data (untuk halaman lain)
    // 3. Default ke 0 jika keduanya tidak tersedia
    const finalCartCount = cartCount !== undefined ? cartCount : (sharedCartCount || 0);
    
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const navigationItems = [
        {
            name: "Beranda",
            href: route("farmer.home"),
            icon: Home,
            current: url === route("farmer.home"),
        },
        {
            name: "Panggil Dokter",
            href: route("farmer.consultations.index"),
            icon: PhoneCall,
            current: url.startsWith(route("farmer.consultations.index")),
        },
        {
            name: "Pasar Ternak",
            href: route("farmer.marketplace"),
            icon: ShoppingBag,
            current: url.startsWith(route("farmer.marketplace")),
        },
        {
            name: "Info Ternak",
            href: route("farmer.articles"),
            icon: BookOpen,
            current: url.startsWith(route("farmer.articles")),
        },
    ];

    const notifications = [
        { id: 1, text: "Konsultasi Disetujui - Dokter Ani", time: "30 menit yang lalu", read: false },
        { id: 2, text: "Pesanan #12345 sedang dalam perjalanan", time: "2 jam yang lalu", read: false },
        { id: 3, text: "Artikel baru telah ditambahkan", time: "1 hari yang lalu", read: true },
    ];

    return (
        <div className="min-h-screen bg-neutral-lightest flex flex-col">
            <header className="bg-white shadow-soft sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link href={route("farmer.home")} className="flex items-center">
                            <span className="ml-2 text-xl font-heading font-bold text-primary">TernakCare</span>
                        </Link>

                        <div className="hidden md:flex items-center space-x-4">
                            {navigationItems.map((item) => (
                                <NavigationItem key={item.name} item={item} />
                            ))}
                        </div>

                        <div className="flex items-center">
                            {/* Gunakan finalCartCount untuk memastikan konsistensi jumlah item di semua halaman */}
                            <CartButton cartCount={finalCartCount} />
                            
                            {notificationsOpen && (
                                <NotificationPanel
                                    notifications={notifications}
                                    onClose={() => setNotificationsOpen(false)}
                                />
                            )}
                            <button
                                onClick={() => setNotificationsOpen(!notificationsOpen)}
                                className="md:block hidden"
                            >
                                <Bell className="h-6 w-6 mx-4 text-neutral-dark hover:text-primary" />
                            </button>

                            <ProfileDropdown
                                user={user}
                                dropdownOpen={dropdownOpen}
                                toggleDropdown={() => setDropdownOpen(!dropdownOpen)}
                            />

                            <div className="ml-3 md:hidden">
                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="p-2 rounded-md text-neutral-dark hover:text-primary focus:outline-none"
                                >
                                    {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden px-2 pt-2 pb-3 space-y-1">
                        {navigationItems.map((item) => (
                            <NavigationItem key={item.name} item={{ ...item, mobile: true }} onClick={() => setMobileMenuOpen(false)} />
                        ))}
                        <Link
                            href={route("logout")}
                            method="post"
                            as="button"
                            className="w-full text-left px-3 py-2 rounded-md text-base font-medium flex items-center text-neutral-dark hover:text-danger hover:bg-danger/10"
                        >
                            <LogOut className="mr-3 h-5 w-5" />
                            Keluar
                        </Link>
                    </div>
                )}
            </header>

            <main className="flex-grow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {children}
                </div>
            </main>

            <Footer />
        </div>
    );
}