import React, { useState, useEffect } from 'react';
import Button from '@/Components/Common/Button';
import InputError from '@/Components/Common/InputError';

const ProductForm = ({ product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    image: null
  });
  
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price ? String(product.price) : '',
        stock: product.stock ? String(product.stock) : '',
        category: product.category || '',
        image: null
      });
      
      if (product.image) {
        setImagePreview(product.image);
      }
    }
  }, [product]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file
      });
      
      // Show image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Clear error for image
      if (errors.image) {
        setErrors({
          ...errors,
          image: ''
        });
      }
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nama produk wajib diisi';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Deskripsi produk wajib diisi';
    }
    
    if (!formData.price) {
      newErrors.price = 'Harga wajib diisi';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Harga harus berupa angka positif';
    }
    
    if (!formData.stock) {
      newErrors.stock = 'Stok wajib diisi';
    } else if (isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      newErrors.stock = 'Stok harus berupa angka non-negatif';
    }
    
    if (!formData.category) {
      newErrors.category = 'Kategori wajib dipilih';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Convert price and stock to numbers
      const submissionData = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock)
      };
      
      // In a real app, you would handle file upload here
      // For now, we'll just pass the image preview as the image
      if (imagePreview && !formData.image) {
        submissionData.image = imagePreview;
      }
      
      await onSubmit(submissionData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const removeImage = () => {
    setFormData({
      ...formData,
      image: null
    });
    setImagePreview(null);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Product Image */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-dark mb-2">
          Foto Produk
        </label>
        
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-light border-dashed rounded-md">
          {imagePreview ? (
            <div className="space-y-2 text-center">
              <div className="relative w-32 h-32 mx-auto">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-32 w-32 mx-auto object-cover rounded"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex text-sm justify-center">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                >
                  <span>Ganti foto</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-neutral"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                >
                  <span>Upload foto</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                </label>
                <p className="pl-1 text-neutral">atau drag and drop</p>
              </div>
              <p className="text-xs text-neutral">
                PNG, JPG, GIF hingga 5MB
              </p>
            </div>
          )}
        </div>
        
        {errors.image && <InputError message={errors.image} className="mt-1" />}
      </div>

      {/* Product Name */}
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-neutral-dark mb-1">
          Nama Produk
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-neutral-light shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          placeholder="Masukkan nama produk"
        />
        {errors.name && <InputError message={errors.name} className="mt-1" />}
      </div>

      {/* Product Description */}
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-neutral-dark mb-1">
          Deskripsi
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-neutral-light shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          placeholder="Masukkan deskripsi produk"
        />
        {errors.description && <InputError message={errors.description} className="mt-1" />}
      </div>

      {/* Price and Stock */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-neutral-dark mb-1">
            Harga (Rp)
          </label>
          <input
            type="text"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-neutral-light shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            placeholder="0"
          />
          {errors.price && <InputError message={errors.price} className="mt-1" />}
        </div>
        
        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-neutral-dark mb-1">
            Stok
          </label>
          <input
            type="text"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-neutral-light shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            placeholder="0"
          />
          {errors.stock && <InputError message={errors.stock} className="mt-1" />}
        </div>
      </div>

      {/* Category */}
      <div className="mb-6">
        <label htmlFor="category" className="block text-sm font-medium text-neutral-dark mb-1">
          Kategori
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-neutral-light shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
        >
          <option value="">Pilih kategori</option>
          <option value="pakan">Pakan Ternak</option>
          <option value="obat">Obat & Vitamin</option>
          <option value="peralatan">Peralatan</option>
        </select>
        {errors.category && <InputError message={errors.category} className="mt-1" />}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-lighter">
        <Button
          type="button"
          onClick={onCancel}
          className="bg-white border border-neutral-light text-neutral-dark hover:bg-neutral-lightest"
          disabled={isSubmitting}
        >
          Batal
        </Button>
        
        <Button
          type="submit"
          className="bg-primary text-white hover:bg-primary-dark"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Menyimpan...
            </>
          ) : product ? 'Perbarui Produk' : 'Simpan Produk'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;