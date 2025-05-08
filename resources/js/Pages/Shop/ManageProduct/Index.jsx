import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import ShopLayout from '@/Layouts/ShopLayout';
import Card from '@/Components/Shop/Card';
import Button from '@/Components/Common/Button';
import Modal from '@/Components/Common/Modal';
import ProductForm from '@/Components/Shop/ProductForm';
import ProductCard from '@/Components/Shop/ProductCard';
import Alert from '@/Components/Common/Alert';

const ManageProducts = ({ auth }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Fetch products in a real application
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      // Mock data - in a real app, this would be fetched from an API
      setTimeout(() => {
        setProducts([
          {
            id: 1,
            name: 'Pakan Ternak Premium',
            description: 'Pakan ternak berkualitas tinggi untuk pertumbuhan optimal',
            price: 150000,
            stock: 45,
            image: null,
            category: 'pakan',
            status: 'active',
            created_at: '2025-04-15T10:30:00'
          },
          {
            id: 2,
            name: 'Vitamin Ternak',
            description: 'Suplemen vitamin untuk menjaga kesehatan ternak',
            price: 175000,
            stock: 30,
            image: null,
            category: 'obat',
            status: 'active',
            created_at: '2025-04-18T14:15:00'
          },
          {
            id: 3,
            name: 'Obat Cacing Ternak',
            description: 'Obat anti parasit untuk ternak',
            price: 95000,
            stock: 22,
            image: null,
            category: 'obat',
            status: 'active',
            created_at: '2025-04-22T09:45:00'
          },
          {
            id: 4,
            name: 'Pakan Organik',
            description: 'Pakan organik alami tanpa bahan kimia',
            price: 300000,
            stock: 15,
            image: null,
            category: 'pakan',
            status: 'inactive',
            created_at: '2025-04-25T16:20:00'
          }
        ]);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching products:', error);
      setIsLoading(false);
      showAlert('error', 'Gagal memuat produk');
    }
  };

  const handleAddProduct = () => {
    setCurrentProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setCurrentProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      try {
        // In a real app, this would call an API
        setProducts(products.filter(product => product.id !== productId));
        showAlert('success', 'Produk berhasil dihapus');
      } catch (error) {
        console.error('Error deleting product:', error);
        showAlert('error', 'Gagal menghapus produk');
      }
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      // In a real app, this would call an API
      const updatedProducts = products.map(p => {
        if (p.id === product.id) {
          return { ...p, status: p.status === 'active' ? 'inactive' : 'active' };
        }
        return p;
      });
      setProducts(updatedProducts);
      showAlert('success', `Produk berhasil ${product.status === 'active' ? 'dinonaktifkan' : 'diaktifkan'}`);
    } catch (error) {
      console.error('Error updating product status:', error);
      showAlert('error', 'Gagal mengubah status produk');
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (currentProduct) {
        // Update existing product
        const updatedProducts = products.map(p => {
          if (p.id === currentProduct.id) {
            return { ...p, ...formData };
          }
          return p;
        });
        setProducts(updatedProducts);
        showAlert('success', 'Produk berhasil diperbarui');
      } else {
        // Add new product
        const newProduct = {
          id: Math.max(...products.map(p => p.id), 0) + 1,
          ...formData,
          status: 'active',
          created_at: new Date().toISOString()
        };
        setProducts([newProduct, ...products]);
        showAlert('success', 'Produk berhasil ditambahkan');
      }
      setShowModal(false);
    } catch (error) {
      console.error('Error saving product:', error);
      showAlert('error', 'Gagal menyimpan produk');
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
  };

  const filteredProducts = filter === 'all'
    ? products
    : products.filter(product => product.status === filter);

  return (
    <ShopLayout user={auth.user}>
      <Head title="Kelola Produk" />
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-2xl font-heading font-semibold text-neutral-darkest">Kelola Produk</h1>
            
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
              <div className="flex rounded-md shadow-sm">
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                    filter === 'all'
                      ? 'bg-primary text-white'
                      : 'bg-white text-neutral-dark hover:bg-neutral-lightest'
                  } border border-neutral-light`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('active')}
                  className={`px-4 py-2 text-sm font-medium ${
                    filter === 'active'
                      ? 'bg-primary text-white'
                      : 'bg-white text-neutral-dark hover:bg-neutral-lightest'
                  } border-t border-b border-neutral-light`}
                >
                  Aktif
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('inactive')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                    filter === 'inactive'
                      ? 'bg-primary text-white'
                      : 'bg-white text-neutral-dark hover:bg-neutral-lightest'
                  } border border-neutral-light`}
                >
                  Nonaktif
                </button>
              </div>
              
              <Button onClick={handleAddProduct} className="bg-primary text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Tambah Produk
              </Button>
            </div>
          </div>
          
          {alert.show && (
            <Alert type={alert.type} message={alert.message} className="mb-4" />
          )}
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {filteredProducts.length === 0 ? (
                <Card className="text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-neutral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-neutral-darkest">Belum ada produk</h3>
                  <p className="mt-1 text-neutral">Tambahkan produk pertama Anda untuk mulai berjualan</p>
                  <Button onClick={handleAddProduct} className="mt-4 bg-primary text-white">
                    Tambah Produk
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onEdit={() => handleEditProduct(product)}
                      onDelete={() => handleDeleteProduct(product.id)}
                      onToggleStatus={() => handleToggleStatus(product)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={currentProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
      >
        <ProductForm
          product={currentProduct}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </ShopLayout>
  );
};

export default ManageProducts;