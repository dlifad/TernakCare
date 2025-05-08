import React from 'react';
import { Link } from '@inertiajs/react';

const ArticleCard = ({ article }) => {
  // Function to truncate text to a specific number of words
  const truncateText = (text, maxWords) => {
    const words = text.split(' ');
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(' ') + '...';
    }
    return text;
  };

  // Format date to a more readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-card hover:shadow-lg transition-shadow duration-300">
      {article.image && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={article.image} 
            alt={article.title} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute top-3 left-3">
            <span className="bg-primary px-3 py-1 rounded-full text-white text-xs font-medium">
              {article.category}
            </span>
          </div>
        </div>
      )}
      
      <div className="p-5">
        <div className="flex items-center text-neutral text-sm mb-2">
          <span className="mr-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(article.created_at)}
          </span>
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {article.views} kali dibaca
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-neutral-darkest mb-2 line-clamp-2">
          {article.title}
        </h3>
        
        <p className="text-neutral-dark mb-4 line-clamp-3">
          {truncateText(article.content, 25)}
        </p>
        
        <Link 
          href={`/farmer/articles/${article.id}`} 
          className="inline-flex items-center text-accent-dark font-medium hover:text-accent transition-colors"
        >
          Baca selengkapnya
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default ArticleCard;