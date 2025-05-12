// resources/js/Pages/Farmer/Article/Detail.jsx

import React from 'react';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import FarmerLayout from '@/Layouts/FarmerLayout';

const ArticleDetail = ({ auth, article }) => {
  const categoryColors = {
    kesehatan: 'bg-green-100 text-green-800',
    pakan: 'bg-yellow-100 text-yellow-800',
    reproduksi: 'bg-purple-100 text-purple-800',
    pemeliharaan: 'bg-blue-100 text-blue-800',
    tips: 'bg-orange-100 text-orange-800',
  };

  const categoryColor = categoryColors[article.category] || 'bg-gray-100 text-gray-800';
  const formattedDate = article.created_at 
    ? format(new Date(article.created_at), 'dd MMMM yyyy', { locale: id })
    : '';

  return (
    <FarmerLayout user={auth.user}>
      <Head title={article.title} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <a 
            href="/artikel" 
            className="inline-flex items-center text-primary hover:text-primary-dark mb-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Kembali ke Info Ternak
          </a>
          
          <div className="flex items-center justify-between mb-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColor}`}>
              {article.category ? article.category.charAt(0).toUpperCase() + article.category.slice(1) : 'Umum'}
            </span>
            <span className="text-sm text-neutral-dark">{formattedDate}</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-neutral-darkest leading-tight">
            {article.title}
          </h1>
        </div>
        
        {article.featured_image && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img 
            src={article.featured_image 
                ? `/storage/${article.featured_image}` 
                : '/images/default-article.jpg'} 
            alt={article.title}
            className="w-full h-full object-cover"
            />

          </div>
        )}
        
        <div className="prose prose-lg max-w-none text-justify">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>
      </div>
    </FarmerLayout>
  );
};

export default ArticleDetail;