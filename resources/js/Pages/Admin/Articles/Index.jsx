import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import ArticleTable from '@/Components/Admin/ArticleTable';
import { FilePlus, Search } from 'lucide-react';

export default function Index({ articles, flash = {} }) {
  return (
    <AdminLayout>
      <Head title="Manajemen Artikel" />
      
      <div className="py-4">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center justify-between">
            <h1 className="text-2xl font-semibold text-neutral-darkest">Manajemen Artikel</h1>
            <Link
              href={route('admin.articles.create')}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            >
              <FilePlus className="w-5 h-5 mr-2" />
              Tambah Artikel Baru
            </Link>
          </div>
          
          {flash.success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-200 text-green-700 rounded-md">
              {flash.success}
            </div>
          )}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-neutral" />
              </div>
              <input
                type="text"
                placeholder="Cari artikel..."
                className="pl-10 pr-4 py-2 border-neutral-light focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border rounded-md"
              />
            </div>
          </div>
          
          <ArticleTable articles={articles} />
          
          {articles.links && articles.links.length > 3 && (
            <div className="mt-6 px-4 py-3 flex items-center justify-between border-t border-neutral-light sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                {articles.prev_page_url && (
                  <Link
                    href={articles.prev_page_url}
                    className="relative inline-flex items-center px-4 py-2 border border-neutral-light text-sm font-medium rounded-md text-neutral-dark bg-white hover:bg-neutral-light"
                  >
                    Sebelumnya
                  </Link>
                )}
                {articles.next_page_url && (
                  <Link
                    href={articles.next_page_url}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-neutral-light text-sm font-medium rounded-md text-neutral-dark bg-white hover:bg-neutral-light"
                  >
                    Berikutnya
                  </Link>
                )}
              </div>
              
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-neutral-dark">
                    Menampilkan{' '}
                    <span className="font-medium">{articles.from}</span>{' '}
                    sampai{' '}
                    <span className="font-medium">{articles.to}</span>{' '}
                    dari{' '}
                    <span className="font-medium">{articles.total}</span>{' '}
                    artikel
                  </p>
                </div>
                
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    {articles.links.map((link, index) => {
                      // Skip the "Previous" and "Next" links as they are handled separately
                      if (index === 0 || index === articles.links.length - 1) {
                        return null;
                      }
                      
                      return (
                        <Link
                          key={index}
                          href={link.url || '#'}
                          className={`${
                            link.active
                              ? 'z-10 bg-primary text-white border-primary'
                              : 'bg-white text-neutral-dark border-neutral-light hover:bg-neutral-lightest'
                          } ${
                            !link.url ? 'opacity-50 cursor-not-allowed' : ''
                          } relative inline-flex items-center px-4 py-2 border text-sm font-medium`}
                          dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                      );
                    })}
                  </nav>
                </div>
              </div>
              
              <div className="hidden sm:block">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <Link
                    href={articles.prev_page_url || '#'}
                    className={`${
                      !articles.prev_page_url ? 'opacity-50 cursor-not-allowed' : ''
                    } relative inline-flex items-center px-2 py-2 rounded-l-md border border-neutral-light bg-white text-sm font-medium text-neutral-dark hover:bg-neutral-lightest`}
                  >
                    <span className="sr-only">Sebelumnya</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </Link>
                  
                  <Link
                    href={articles.next_page_url || '#'}
                    className={`${
                      !articles.next_page_url ? 'opacity-50 cursor-not-allowed' : ''
                    } relative inline-flex items-center px-2 py-2 rounded-r-md border border-neutral-light bg-white text-sm font-medium text-neutral-dark hover:bg-neutral-lightest`}
                  >
                    <span className="sr-only">Berikutnya</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}