import React from 'react';
import { Link, router } from '@inertiajs/react';
import { Pencil, Trash2, Eye, Star, StarOff, ToggleLeft, ToggleRight } from 'lucide-react';

export default function ArticleTable({ articles }) {
  const handleDelete = (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus artikel ini?')) {
      router.delete(route('admin.articles.destroy', id));
    }
  };

  const toggleFeatured = (id) => {
    router.put(route('admin.articles.toggle-featured', id));
  };

  const togglePublished = (id) => {
    router.put(route('admin.articles.toggle-published', id));
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-neutral-light">
        <thead className="bg-neutral-light">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
              Judul
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
              Kategori
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
              Penulis
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
              Unggulan
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
              Tanggal
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-dark uppercase tracking-wider">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-neutral-light">
          {articles.data.length > 0 ? (
            articles.data.map((article) => (
              <tr key={article.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-neutral-darkest">{article.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-neutral-dark">{article.category || '—'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-neutral-dark">{article.user ? article.user.name : '—'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button 
                    onClick={() => togglePublished(article.id)}
                    className="flex items-center text-sm"
                  >
                    {article.is_published ? (
                      <>
                        <ToggleRight className="h-5 w-5 text-green-600 mr-1" />
                        <span className="text-green-600">Terpublikasi</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-5 w-5 text-neutral-dark mr-1" />
                        <span className="text-neutral-dark">Draft</span>
                      </>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button 
                    onClick={() => toggleFeatured(article.id)}
                    className="text-sm"
                  >
                    {article.featured ? (
                      <Star className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <StarOff className="h-5 w-5 text-neutral" />
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-neutral-dark">
                    {new Date(article.created_at).toLocaleDateString('id-ID')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Link 
                      href={route('admin.articles.show', article.id)} 
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="h-5 w-5" />
                    </Link>
                    <Link 
                      href={route('admin.articles.edit', article.id)} 
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <Pencil className="h-5 w-5" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(article.id)} 
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="px-6 py-4 text-center text-neutral-dark">
                Tidak ada artikel yang ditemukan.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}   