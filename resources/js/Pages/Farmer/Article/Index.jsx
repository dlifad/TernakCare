import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import FarmerLayout from '@/Layouts/FarmerLayout';
import ArticleCard from '@/Components/Farmer/ArticleCard';
import Pagination from '@/Components/Common/Pagination';
// import { getArticles } from '@/Services/article';

const Articles = ({ auth }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'kesehatan', 'pakan', 'reproduksi', 'pemeliharaan', 'tips'];

  useEffect(() => {
    loadArticles();
  }, [currentPage, selectedCategory]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const response = await getArticles({
        page: currentPage,
        category: selectedCategory !== 'all' ? selectedCategory : '',
        search: searchQuery
      });
      
      setArticles(response.data);
      setTotalPages(response.meta.last_page);
      setLoading(false);
    } catch (error) {
      console.error('Error loading articles:', error);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadArticles();
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  return (
    <FarmerLayout user={auth.user}>
      <Head title="Info Ternak" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold text-neutral-darkest">Info Ternak</h1>
          <p className="text-neutral-dark mt-2">Baca artikel terbaru seputar peternakan dan kesehatan hewan</p>
        </div>

        <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari artikel..."
                className="w-full md:w-80 px-4 py-2 pr-10 rounded-lg border border-neutral-light focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-neutral p-1 hover:text-primary-dark"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Categories filter */}
          <div className="w-full md:w-auto flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-neutral-lightest text-neutral-dark hover:bg-primary-light'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            <div className="mt-8">
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
              />
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-neutral-dark text-lg">Artikel tidak ditemukan</div>
            <p className="mt-2 text-neutral">Coba ubah filter atau kata kunci pencarian</p>
          </div>
        )}
      </div>
    </FarmerLayout>
  );
};

export default Articles;