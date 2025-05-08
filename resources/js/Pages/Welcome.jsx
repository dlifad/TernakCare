// resources/js/Pages/Welcome.jsx
import React from 'react';
import { Link, Head } from '@inertiajs/react';

// Import Components
import Button from '@/Components/LandingPage/Button';
import Card from '@/Components/LandingPage/Card';
import SearchInput from '@/Components/LandingPage/SearchInput';
import Newsletter from '@/Components/LandingPage/Newsletter';
import Footer from '@/Components/Common/Footer';

export default function Welcome({ auth }) {
    const handleSearch = (query) => {
        console.log("Searching for:", query);
    };

    return (
        <>
            <Head title="TernakCare - Layanan Dokter Hewan Online" />
            
            <div className="min-h-screen bg-neutral-lightest">
                {/* Navbar */}
                <nav className="bg-white shadow-soft">
                    <div className="container">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <Link href="/">
                                    <div className="font-bold text-2xl text-primary">TernakCare</div>
                                </Link>
                            </div>
                            
                            <div className="hidden md:flex md:items-center md:justify-center flex-1 px-4 mx-4">
                                <SearchInput 
                                    placeholder="Cari dokter, produk, atau artikel..." 
                                    onSearch={handleSearch}
                                />
                            </div>
                            
                            <div className="hidden sm:flex sm:items-center sm:space-x-4">
                                {auth?.user ? (
                                    <Link href={route('dashboard')}>
                                        <Button>Dashboard</Button>
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="text-primary hover:text-primary-dark px-3 py-2 rounded-md text-sm font-medium"
                                        >
                                            Login
                                        </Link>
                                        <Link href={route('register')}>
                                            <Button>Register</Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <div className="py-12 bg-gradient-to-b from-neutral-lightest to-neutral-light">
                    <div className="container">
                        <div className="text-center">
                            <h1 className="text-4xl tracking-tight font-extrabold text-neutral-darkest sm:text-5xl md:text-6xl font-heading">
                                <span className="block">Solusi Kesehatan</span>
                                <span className="block text-primary">Untuk Ternak Anda</span>
                            </h1>
                            <p className="mt-3 max-w-md mx-auto text-base text-neutral-dark sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                                Konsultasi dengan dokter hewan terbaik, temukan produk berkualitas, dan dapatkan informasi ternak terbaru
                            </p>
                            <div className="mt-8 flex justify-center space-x-4">
                                <Link href={route('register')}>
                                    <Button variant="primary" className="px-8 py-3 text-base">Daftar Sekarang</Button>
                                </Link>
                                <Link href="#fitur">
                                    <Button variant="outline" className="px-8 py-3 text-base">Pelajari Fitur</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feature Cards */}
                <div id="fitur" className="section">
                    <div className="container">
                        <h2 className="text-3xl font-bold text-center text-neutral-darkest mb-12 font-heading">Layanan Utama Kami</h2>
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {/* Panggil Dokter */}
                            <Card 
                                title="Panggil Dokter"
                                description="Konsultasi langsung dengan dokter hewan berpengalaman via chat, video call, atau kunjungan langsung"
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                    </svg>
                                }
                                buttonText="Konsultasi Sekarang"
                                buttonLink={route('login')}
                                buttonVariant="secondary"
                            />

                            {/* Pasar Ternak */}
                            <Card 
                                title="Pasar Ternak"
                                description="Temukan berbagai produk dan kebutuhan peternakan berkualitas dari toko-toko terpercaya"
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                                    </svg>
                                }
                                buttonText="Jelajahi Pasar"
                                buttonLink={route('login')}
                                buttonVariant="secondary"
                            />

                            {/* Info Ternak */}
                            <Card 
                                title="Info Ternak"
                                description="Dapatkan artikel dan informasi terbaru seputar perawatan dan pengembangan ternak"
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
                                    </svg>
                                }
                                buttonText="Baca Artikel"
                                buttonLink={route('login')}
                                buttonVariant="secondary"
                            />
                        </div>
                    </div>
                </div>

                {/* How It Works Section */}
                <div className="section bg-white">
                    <div className="container">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-neutral-darkest font-heading">Cara Kerja TernakCare</h2>
                            <p className="mt-4 text-lg text-neutral">Mudah dan cepat mendapatkan layanan untuk ternak Anda</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-light text-primary-dark mb-4">
                                    <span className="text-2xl font-bold">1</span>
                                </div>
                                <h3 className="text-xl font-medium text-neutral-dark mb-2">Buat Akun</h3>
                                <p className="text-neutral">Daftar dengan mudah dan lengkapi profil Anda</p>
                            </div>
                            
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-light text-primary-dark mb-4">
                                    <span className="text-2xl font-bold">2</span>
                                </div>
                                <h3 className="text-xl font-medium text-neutral-dark mb-2">Pilih Layanan</h3>
                                <p className="text-neutral">Konsultasi dokter, belanja produk, atau baca artikel</p>
                            </div>
                            
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-light text-primary-dark mb-4">
                                    <span className="text-2xl font-bold">3</span>
                                </div>
                                <h3 className="text-xl font-medium text-neutral-dark mb-2">Dapatkan Solusi</h3>
                                <p className="text-neutral">Nikmati layanan terbaik untuk kesehatan ternak Anda</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Newsletter & Info Section */}
                <div className="section">
                    <div className="container">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <h2 className="text-2xl font-bold text-neutral-darkest mb-4 font-heading">Tentang TernakCare</h2>
                                <p className="text-neutral mb-4">
                                    TernakCare adalah platform inovatif yang menghubungkan peternak dengan dokter hewan profesional, 
                                    menyediakan akses ke marketplace produk peternakan berkualitas, dan menyajikan informasi 
                                    terkini tentang kesehatan dan pengelolaan ternak.
                                </p>
                                <p className="text-neutral mb-4">
                                    Visi kami adalah menjadi platform terdepan dalam mendukung kesuksesan industri peternakan 
                                    di Indonesia melalui teknologi dan layanan berkualitas.
                                </p>
                                <div className="mt-6">
                                    <Link href={route('register')}>
                                        <Button variant="primary">Bergabung Sekarang</Button>
                                    </Link>
                                </div>
                            </div>
                            
                            <div>
                                <Newsletter />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mitra Invitation Section */}
                <div className="section bg-neutral-light">
                    <div className="container">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-neutral-darkest font-heading">Gabung Sebagai Mitra</h2>
                            <p className="mt-4 text-lg text-neutral">Buka peluang baru dengan menjadi mitra dokter hewan atau toko peternakan di TernakCare</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Dokter Hewan */}
                            <div className="bg-white p-8 rounded-2xl shadow-soft text-center">
                                <h3 className="text-xl font-bold text-neutral-darkest mb-4">Untuk Dokter Hewan</h3>
                                <p className="text-neutral mb-6">
                                    Bergabunglah sebagai dokter hewan profesional dan bantu peternak di seluruh Indonesia 
                                    dengan layanan konsultasi terbaik.
                                </p>
                                <Link href={route('register.doctor')}>
                                    <Button variant="primary">Daftar Sebagai Dokter</Button>
                                </Link>
                            </div>

                            {/* Toko Peternakan */}
                            <div className="bg-white p-8 rounded-2xl shadow-soft text-center">
                                <h3 className="text-xl font-bold text-neutral-darkest mb-4">Untuk Toko Peternakan</h3>
                                <p className="text-neutral mb-6">
                                    Perluas jangkauan penjualan produk peternakan Anda dengan bergabung sebagai mitra toko di platform kami.
                                </p>
                                <Link href={route('register.shop')}>
                                    <Button variant="primary">Daftar Sebagai Toko</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>


                {/* CTA Section */}
                <div className="bg-primary py-12">
                    <div className="container">
                        <div className="text-center">
                            <h2 className="text-3xl font-extrabold text-white sm:text-4xl font-heading">
                                <span className="block">Siap bergabung dengan TernakCare?</span>
                            </h2>
                            <p className="mt-4 text-lg leading-6 text-white opacity-90">
                                Daftar sekarang untuk mengakses semua layanan kami
                            </p>
                            <div className="mt-8 flex justify-center space-x-4">
                                <Link href={route('register')}>
                                    <Button variant="white" className="px-8 py-3 text-base">Daftar Sekarang</Button>
                                </Link>
                                <Link href={route('login')}>
                                    <Button variant="primary" className="px-8 py-3 text-base bg-primary-dark">Login</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <Footer />
            </div>
        </>
    );
}