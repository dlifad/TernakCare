import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { X, Upload } from 'lucide-react';

export default function ArticleForm({ article = null, mode = 'create' }) {
  const { data, setData, errors, post, processing, reset } = useForm({
    title: article?.title || '',
    content: article?.content || '',
    category: article?.category || '',
    featured_image: null,
    is_published: article?.is_published ?? false,
    featured: article?.featured ?? false,
    _method: mode === 'edit' ? 'put' : '',
    remove_image: false,
  });

  const [imagePreview, setImagePreview] = useState(
    article?.featured_image ? `/storage/${article.featured_image}` : null
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    const routeName = mode === 'create'
      ? route('admin.articles.store')
      : route('admin.articles.update', article.id);

    post(routeName, {
      forceFormData: true,
      onSuccess: () => {
        if (mode === 'create') reset();
      },
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setData('featured_image', file);
      setData('remove_image', false);

      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setData('featured_image', null);
    setData('remove_image', true);
    setImagePreview(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      {/* Title */}
      <FormGroup
        id="title"
        label="Judul Artikel"
        required
        value={data.title}
        onChange={(e) => setData('title', e.target.value)}
        error={errors.title}
      />

      {/* Category */}
      <FormGroup
        id="category"
        label="Kategori"
        value={data.category}
        onChange={(e) => setData('category', e.target.value)}
        error={errors.category}
      />

      {/* Featured Image */}
      <div>
        <label htmlFor="featured_image" className="block text-sm font-medium text-neutral-dark">
          Gambar Unggulan
        </label>
        <div className="mt-1 flex items-center">
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-32 w-auto rounded-md object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <ImageUpload onChange={handleImageChange} />
          )}
        </div>
        {errors.featured_image && (
          <p className="mt-1 text-sm text-red-600">{errors.featured_image}</p>
        )}
      </div>

      {/* Content */}
      <FormGroup
        id="content"
        label="Konten Artikel"
        required
        isTextarea
        rows={10}
        value={data.content}
        onChange={(e) => setData('content', e.target.value)}
        error={errors.content}
      />

      {/* Options */}
      <div className="flex items-center space-x-6">
        <Checkbox
          id="is_published"
          label="Publikasikan Artikel"
          checked={data.is_published}
          onChange={(e) => setData('is_published', e.target.checked)}
        />
        <Checkbox
          id="featured"
          label="Jadikan Artikel Unggulan"
          checked={data.featured}
          onChange={(e) => setData('featured', e.target.checked)}
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={processing}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          {processing ? 'Memproses...' : mode === 'create' ? 'Simpan Artikel' : 'Perbarui Artikel'}
        </button>
      </div>
    </form>
  );
}

/* --- Reusable Components --- */

const FormGroup = ({ id, label, required, value, onChange, error, isTextarea, rows = 4 }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-neutral-dark">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {isTextarea ? (
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        rows={rows}
        required={required}
        className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-neutral-light rounded-md p-2"
      />
    ) : (
      <input
        type="text"
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-neutral-light rounded-md p-2"
      />
    )}
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

const Checkbox = ({ id, label, checked, onChange }) => (
  <div className="flex items-center">
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 text-primary focus:ring-primary border-neutral rounded"
    />
    <label htmlFor={id} className="ml-2 block text-sm text-neutral-dark">
      {label}
    </label>
  </div>
);

const ImageUpload = ({ onChange }) => (
  <div className="flex items-center justify-center w-full">
    <label
      htmlFor="featured_image"
      className="flex flex-col items-center justify-center w-full h-32 border-2 border-neutral-light border-dashed rounded-lg cursor-pointer bg-neutral-lightest hover:bg-neutral-light"
    >
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        <Upload className="w-8 h-8 mb-2 text-neutral-dark" />
        <p className="mb-2 text-sm text-neutral-dark">Klik untuk upload gambar</p>
      </div>
      <input
        id="featured_image"
        type="file"
        onChange={onChange}
        className="hidden"
        accept="image/*"
      />
    </label>
  </div>
);
