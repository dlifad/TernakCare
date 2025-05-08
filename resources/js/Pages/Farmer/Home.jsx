import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { CalendarDays, ShoppingBag, BookOpen, Clock, ArrowRight, Bell } from 'lucide-react';
import FarmerLayout from '@/Layouts/FarmerLayout';
import ArticleCard from '@/Components/Farmer/ArticleCard';
import MarketplaceCard from '@/Components/Farmer/MarketplaceCard';

export default function Home({ auth, featuredArticles, featuredProducts }) {
  return (
    <FarmerLayout user={auth.user}>
      <Head title="Beranda Peternak" />
      
      {/* Hero Section */}
      <div className="relative bg-primary-light rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-[url('/storage/images/farm-pattern.png')] opacity-10"></div>
        <div className="relative p-6 md:p-10 max-w-4xl">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-neutral-darkest mb-4">
            Selamat Datang, {auth.user.name}!
          </h1>
          <p className="text-neutral-dark text-lg mb-6">
            Platform terpadu untuk kebutuhan peternakan Anda. Konsultasi dengan dokter hewan, jelajahi pasar ternak, dan dapatkan informasi terkini.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href={route('farmer.consultations.index')}
              className="inline-flex items-center px-5 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition duration-300 font-medium shadow-soft"
            >
              Panggil Dokter Hewan
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href={route('farmer.marketplace')}
              className="inline-flex items-center px-5 py-3 bg-white hover:bg-neutral-lightest text-primary border border-primary rounded-lg transition duration-300 font-medium"
            >
              Jelajahi Pasar Ternak
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="my-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-heading text-xl font-semibold text-neutral-darkest">Notifikasi Terbaru</h2>
          <Link href="#" className="text-primary hover:text-primary-dark text-sm font-medium flex items-center">
            Lihat Semua <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-card">
          <div className="flex items-start gap-3 p-3 border-b border-neutral-lightest">
            <div className="bg-primary-light p-2 rounded-full">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-neutral-darkest">Konsultasi Disetujui</p>
              <p className="text-sm text-neutral">Dokter Ani telah menyetujui permintaan konsultasi Anda pada 8 Mei 2025, pukul 10:00</p>
              <p className="text-xs text-neutral mt-1">30 menit yang lalu</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3">
            <div className="bg-secondary-light p-2 rounded-full">
              <ShoppingBag className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="font-medium text-neutral-darkest">Pesanan Dikirim</p>
              <p className="text-sm text-neutral">Pesanan #12345 sedang dalam perjalanan</p>
              <p className="text-xs text-neutral mt-1">2 jam yang lalu</p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="my-8">
        <h2 className="font-heading text-xl font-semibold text-neutral-darkest mb-4">Layanan Utama</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            href={route('farmer.consultations.index')}
            className="flex flex-col items-center bg-white p-5 rounded-xl shadow-card hover:shadow-lg transition-shadow duration-300"
          >
            <div className="bg-primary-light p-3 rounded-full mb-3">
              <CalendarDays className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium text-center text-neutral-darkest">Panggil Dokter</h3>
            <p className="text-sm text-center text-neutral mt-1">Chat, Video Call, atau Kunjungan</p>
          </Link>
          
          <Link 
            href={route('farmer.marketplace')}
            className="flex flex-col items-center bg-white p-5 rounded-xl shadow-card hover:shadow-lg transition-shadow duration-300"
          >
            <div className="bg-secondary-light p-3 rounded-full mb-3">
              <ShoppingBag className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="font-medium text-center text-neutral-darkest">Pasar Ternak</h3>
            <p className="text-sm text-center text-neutral mt-1">Belanja kebutuhan ternak</p>
          </Link>
          
          <Link 
            href={route('farmer.articles')}
            className="flex flex-col items-center bg-white p-5 rounded-xl shadow-card hover:shadow-lg transition-shadow duration-300"
          >
            <div className="bg-accent-light p-3 rounded-full mb-3">
              <BookOpen className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-medium text-center text-neutral-darkest">Info Ternak</h3>
            <p className="text-sm text-center text-neutral mt-1">Artikel dan tips peternakan</p>
          </Link>
          
          <Link 
            href={route('farmer.activity')}
            className="flex flex-col items-center bg-white p-5 rounded-xl shadow-card hover:shadow-lg transition-shadow duration-300"
          >
            <div className="bg-neutral-light p-3 rounded-full mb-3">
              <Clock className="h-6 w-6 text-neutral" />
            </div>
            <h3 className="font-medium text-center text-neutral-darkest">Riwayat</h3>
            <p className="text-sm text-center text-neutral mt-1">Lihat aktivitas Anda</p>
          </Link>
        </div>
      </div>

      {/* Featured Articles */}
      <div className="my-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-heading text-xl font-semibold text-neutral-darkest">Artikel Terbaru</h2>
          <Link href={route('farmer.articles')} className="text-primary hover:text-primary-dark text-sm font-medium flex items-center">
            Lihat Semua <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredArticles?.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
          {/* Fallback if no articles */}
          {(!featuredArticles || featuredArticles.length === 0) && (
            <div className="col-span-full text-center py-8">
              <p className="text-neutral">Tidak ada artikel terbaru saat ini</p>
            </div>
          )}
        </div>
      </div>

      {/* Featured Products */}
      <div className="my-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-heading text-xl font-semibold text-neutral-darkest">Produk Rekomendasi</h2>
          <Link href={route('farmer.marketplace')} className="text-primary hover:text-primary-dark text-sm font-medium flex items-center">
            Lihat Semua <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featuredProducts?.map(product => (
            <MarketplaceCard key={product.id} product={product} />
          ))}
          {/* Fallback if no products */}
          {(!featuredProducts || featuredProducts.length === 0) && (
            <div className="col-span-full text-center py-8">
              <p className="text-neutral">Tidak ada produk rekomendasi saat ini</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Help Section */}
      <div className="my-8 bg-neutral-lightest rounded-xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="font-heading text-xl font-semibold text-neutral-darkest">Butuh Bantuan?</h2>
            <p className="text-neutral-dark">Tim kami siap membantu Anda 24/7</p>
          </div>
          <div className="flex gap-3">
            <Link href="#" className="px-4 py-2 bg-white text-primary border border-primary rounded-lg hover:bg-primary-light transition duration-300">
              Panduan Penggunaan
            </Link>
            <Link href="#" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition duration-300">
              Hubungi Kami
            </Link>
          </div>
        </div>
      </div>
    </FarmerLayout>
  );
}