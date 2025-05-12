// /resources/js/Services/article.js

import axios from 'axios';

export const getArticles = async ({ page = 1, category = '', search = '' }) => {
  try {
    // Ubah endpoint URL ke /api/farmer/articles
    const response = await axios.get('/api/farmer/articles', {
      params: {
        page,
        category,
        search
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }
};

export const getArticleDetail = async (slug) => {
  try {
    // Ubah endpoint URL ke /api/farmer/articles/${slug}
    const response = await axios.get(`/api/farmer/articles/${slug}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching article detail:', error);
    throw error;
  }
};