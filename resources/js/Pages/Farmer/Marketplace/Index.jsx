import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import FarmerLayout from '@/Layouts/FarmerLayout';
import MarketplaceCard from '@/Components/Farmer/MarketplaceCard';
import { getProducts } from '@/Services/product';
import Pagination from '@/Components/Common/Pagination';

export default function Marketplace() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 12,
        total: 0
    });

    useEffect(() => {
        loadProducts();
    }, [selectedCategory, sortBy, pagination.current_page, searchQuery]);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const response = await getProducts({
                category: selectedCategory !== 'all' ? selectedCategory : null,
                sort: sortBy,
                page: pagination.current_page,
                search: searchQuery
            });
            
            setProducts(response.data);
            setPagination(response.meta);
            
            // Extract unique categories if not already loaded
            if (categories.length === 0) {
                const uniqueCategories = [...new Set(response.data.map(product => product.category))];
                setCategories(uniqueCategories);
            }
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // Reset to first page when searching
        setPagination(prev => ({ ...prev, current_page: 1 }));
    };

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, current_page: page }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setPagination(prev => ({ ...prev, current_page: 1 }));
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
        setPagination(prev => ({ ...prev, current_page: 1 }));
    };

    return (
        <FarmerLayout>
            <Head title="Pasar Ternak" />
            
            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <h1 className="text-2xl font-bold text-neutral-darkest font-heading mb-4 md:mb-0">
                        Pasar Ternak
                    </h1>

                    <form onSubmit={handleSearch} className="w-full md:w-auto flex">
                        <input
                            type="text"
                            placeholder="Cari produk..."
                            className="rounded-l-lg border-r-0 border-neutral-light bg-white focus:ring-2 focus:ring-primary focus:border-transparent px-4 py-2 w-full md:w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button 
                            type="submit"
                            className="bg-primary hover:bg-primary-dark text-white rounded-r-lg px-4 py-2 transition duration-200"
                        >
                            Cari
                        </button>
                    </form>
                </div>

                <div className="bg-white rounded-lg shadow-card p-4 mb-6">
                    <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
                        <div className="flex flex-wrap gap-2">
                            <button
                                className={`px-3 py-1 rounded-full text-sm font-medium 
                                    ${selectedCategory === 'all' 
                                        ? 'bg-primary text-white' 
                                        : 'bg-neutral-lightest text-neutral-dark hover:bg-neutral-light'}`}
                                onClick={() => handleCategoryChange('all')}
                            >
                                Semua
                            </button>
                            
                            {categories.map((category, index) => (
                                <button
                                    key={index}
                                    className={`px-3 py-1 rounded-full text-sm font-medium 
                                        ${selectedCategory === category 
                                            ? 'bg-primary text-white' 
                                            : 'bg-neutral-lightest text-neutral-dark hover:bg-neutral-light'}`}
                                    onClick={() => handleCategoryChange(category)}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                        
                        <div className="flex items-center">
                            <label htmlFor="sort" className="mr-2 text-sm text-neutral-dark">
                                Urutkan:
                            </label>
                            <select
                                id="sort"
                                value={sortBy}
                                onChange={handleSortChange}
                                className="rounded border-neutral-light bg-white focus:ring-2 focus:ring-primary focus:border-transparent px-2 py-1"
                            >
                                <option value="newest">Terbaru</option>
                                <option value="oldest">Terlama</option>
                                <option value="price_low">Harga: Rendah ke Tinggi</option>
                                <option value="price_high">Harga: Tinggi ke Rendah</option>
                                <option value="popular">Terpopuler</option>
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : products.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <MarketplaceCard key={product.id} product={product} />
                            ))}
                        </div>
                        
                        <div className="mt-8">
                            <Pagination
                                currentPage={pagination.current_page}
                                lastPage={pagination.last_page}
                                onChange={handlePageChange}
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-neutral-light mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h2 className="text-xl font-bold text-neutral-dark mb-2">Tidak ada produk ditemukan</h2>
                        <p className="text-neutral mb-4">Coba ubah filter atau kata kunci pencarian Anda</p>
                        <button 
                            onClick={() => {
                                setSelectedCategory('all');
                                setSearchQuery('');
                                setSortBy('newest');
                            }}
                            className="bg-primary hover:bg-primary-dark text-white rounded-lg px-4 py-2 transition duration-200"
                        >
                            Reset Pencarian
                        </button>
                    </div>
                )}
            </div>
        </FarmerLayout>
    );
}