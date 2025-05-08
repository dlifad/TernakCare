import React from 'react';
// import { formatCurrency } from '@/utils';

const ProductCard = ({ product, onEdit, onDelete, onToggleStatus }) => {
  const { id, name, description, price, stock, image, category, status, created_at } = product;
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  // Determine badge color based on category
  const getCategoryBadgeColor = (category) => {
    switch (category) {
      case 'pakan':
        return 'bg-green-100 text-green-800';
      case 'obat':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border border-neutral-lighter">
      {/* Product Image */}
      <div className="h-48 bg-neutral-lightest flex items-center justify-center">
        {image ? (
          <img 
            src={image} 
            alt={name} 
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="text-neutral flex flex-col items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="mt-2 text-sm">Belum ada gambar</span>
          </div>
        )}
      </div>
      
      {/* Product Content */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-neutral-darkest">{name}</h3>
          <span className={`px-2 py-1 text-xs font-medium rounded ${status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {status === 'active' ? 'Aktif' : 'Nonaktif'}
          </span>
        </div>
        
        <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded ${getCategoryBadgeColor(category)}`}>
          {category === 'pakan' ? 'Pakan Ternak' : category === 'obat' ? 'Obat & Vitamin' : category}
        </span>
        
        <p className="mt-2 text-sm text-neutral-dark line-clamp-2">{description}</p>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-neutral">Harga</p>
            <p className="font-medium text-neutral-darker">Rp {price.toLocaleString('id-ID')}</p>
          </div>
          <div>
            <p className="text-xs text-neutral">Stok</p>
            <p className={`font-medium ${stock < 10 ? 'text-red-600' : 'text-neutral-darker'}`}>{stock} unit</p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-neutral-lighter text-xs text-neutral">
          Ditambahkan pada {formatDate(created_at)}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="bg-neutral-lightest px-4 py-3 flex justify-between items-center">
        <button
          onClick={onToggleStatus}
          className={`px-3 py-1 rounded text-sm font-medium ${
            status === 'active'
              ? 'bg-red-50 text-red-700 hover:bg-red-100'
              : 'bg-green-50 text-green-700 hover:bg-green-100'
          }`}
        >
          {status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
        </button>
        
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="p-2 rounded-full hover:bg-neutral-light text-neutral-dark"
            title="Edit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          <button
            onClick={onDelete}
            className="p-2 rounded-full hover:bg-neutral-light text-neutral-dark"
            title="Hapus"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;