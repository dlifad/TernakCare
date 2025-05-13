import { useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import ShopLayout from "@/Layouts/ShopLayout";
import Card from "@/Components/Shop/Card";
import Button from "@/Components/Common/Button";
import Modal from "@/Components/Common/Modal";
import ProductForm from "@/Components/Shop/ProductForm";
import ProductCard from "@/Components/Shop/ProductCard";
import Alert from "@/Components/Common/Alert";
import { router } from "@inertiajs/react";

const ManageProducts = ({ auth, products, filters, categories }) => {
    const { flash = {} } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [alert, setAlert] = useState({ 
        show: flash.message ? true : false, 
        type: flash.message ? "success" : "", 
        message: flash.message || "" 
    });
    const [filter, setFilter] = useState(filters?.is_active ?? "all");

    const handleAddProduct = () => {
        setCurrentProduct(null);
        setShowModal(true);
    };

    const handleEditProduct = (product) => {
        setCurrentProduct(product);
        setShowModal(true);
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
            router.delete(route('shop.manage-products.destroy', productId), {
                onSuccess: () => {
                    showAlert("success", "Produk berhasil dihapus");
                },
                onError: () => {
                    showAlert("error", "Gagal menghapus produk");
                }
            });
        }
    };

    const handleToggleStatus = (product) => {
        router.post(route('shop.manage-products.toggle-active', product.id), {
            _method: 'put'  // Menggunakan _method untuk mengirim sebagai PUT
        }, {
            onSuccess: () => {
                showAlert("success", `Produk berhasil ${!product.is_active ? "diaktifkan" : "dinonaktifkan"}`);
            },
            onError: () => {
                showAlert("error", "Gagal mengubah status produk");
            }
        });
    };

    const handleSubmit = async (formData) => {
        if (currentProduct) {
            // Update existing product
            router.post(route('shop.manage-products.update', currentProduct.id), {
                ...formData,
                _method: 'put'
            }, {
                onSuccess: () => {
                    setShowModal(false);
                    showAlert("success", "Produk berhasil diperbarui");
                },
                onError: () => {
                    showAlert("error", "Gagal menyimpan produk");
                }
            });
        } else {
            // Add new product
            router.post(route('shop.manage-products.store'), formData, {
                onSuccess: () => {
                    setShowModal(false);
                    showAlert("success", "Produk berhasil ditambahkan");
                },
                onError: () => {
                    showAlert("error", "Gagal menyimpan produk");
                }
            });
        }
    };

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        setTimeout(
            () => setAlert({ show: false, type: "", message: "" }),
            3000
        );
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        router.get(
            route('shop.manage-products.index'),
            { ...filters, is_active: newFilter === "all" ? undefined : newFilter },
            { preserveState: true }
        );

    };

    const filteredProducts = products.data || [];

    return (
        <ShopLayout user={auth.user}>
            <Head title="Kelola Produk" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                        <h1 className="text-2xl font-heading font-semibold text-neutral-darkest">
                            Kelola Produk
                        </h1>

                        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
                            <div className="flex rounded-md shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => handleFilterChange("all")}
                                    className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                                        filter === "all"
                                            ? "bg-primary text-white"
                                            : "bg-white text-neutral-dark hover:bg-neutral-lightest"
                                    } border border-neutral-light`}
                                >
                                    Semua
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleFilterChange("true")}
                                    className={`px-4 py-2 text-sm font-medium ${
                                        filter === "true"
                                            ? "bg-primary text-white"
                                            : "bg-white text-neutral-dark hover:bg-neutral-lightest"
                                    } border-t border-b border-neutral-light`}
                                >
                                    Aktif
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleFilterChange("false")}
                                    className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                                        filter === "false"
                                            ? "bg-primary text-white"
                                            : "bg-white text-neutral-dark hover:bg-neutral-lightest"
                                    } border border-neutral-light`}
                                >
                                    Nonaktif
                                </button>
                            </div>

                            <Button
                                onClick={handleAddProduct}
                                className="bg-primary text-white"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    />
                                </svg>
                                Tambah Produk
                            </Button>
                        </div>
                    </div>

                    {alert.show && (
                        <Alert
                            type={alert.type}
                            message={alert.message}
                            className="mb-4"
                        />
                    )}

                    {filteredProducts.length === 0 ? (
                        <Card className="text-center py-12">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-16 w-16 mx-auto text-neutral"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                />
                            </svg>
                            <h3 className="mt-4 text-lg font-medium text-neutral-darkest">
                                Belum ada produk
                            </h3>
                            <p className="mt-1 text-neutral">
                                Tambahkan produk pertama Anda untuk
                                mulai berjualan
                            </p>
                            <Button
                                onClick={handleAddProduct}
                                className="mt-4 bg-primary text-white"
                            >
                                Tambah Produk
                            </Button>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onEdit={() =>
                                        handleEditProduct(product)
                                    }
                                    onDelete={() =>
                                        handleDeleteProduct(product.id)
                                    }
                                    onToggleStatus={() =>
                                        handleToggleStatus(product)
                                    }
                                    isActive={product.is_active}
                                />
                            ))}
                        </div>
                    )}
                    
                    {products.links && products.links.length > 3 && (
                        <div className="mt-6 flex justify-center">
                            <nav className="flex items-center justify-between">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    {products.links[0].url && (
                                        <a
                                            href={products.links[0].url}
                                            className="relative inline-flex items-center px-4 py-2 border border-neutral-light text-sm font-medium rounded-md text-neutral-dark bg-white hover:bg-neutral-lightest"
                                        >
                                            Sebelumnya
                                        </a>
                                    )}
                                    {products.links[products.links.length - 1].url && (
                                        <a
                                            href={products.links[products.links.length - 1].url}
                                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-neutral-light text-sm font-medium rounded-md text-neutral-dark bg-white hover:bg-neutral-lightest"
                                        >
                                            Selanjutnya
                                        </a>
                                    )}
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-neutral-dark">
                                            Menampilkan{" "}
                                            <span className="font-medium">{products.from}</span> -{" "}
                                            <span className="font-medium">{products.to}</span> dari{" "}
                                            <span className="font-medium">{products.total}</span> produk
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                            {products.links.map((link, i) => {
                                                // Skip "prev" and "next" for desktop view
                                                if (i === 0 || i === products.links.length - 1) return null;
                                                
                                                return link.url ? (
                                                    <a
                                                        key={i}
                                                        href={link.url}
                                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                                                            ${link.active
                                                                ? "z-10 bg-primary border-primary text-white"
                                                                : "bg-white border-neutral-light text-neutral-dark hover:bg-neutral-lightest"
                                                            }
                                                            ${i === 1 ? "rounded-l-md" : ""}
                                                            ${i === products.links.length - 2 ? "rounded-r-md" : ""}
                                                        `}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ) : (
                                                    <span
                                                        key={i}
                                                        className="relative inline-flex items-center px-4 py-2 border border-neutral-light bg-white text-sm font-medium text-neutral-light"
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                );
                                            })}
                                        </nav>
                                    </div>
                                </div>
                            </nav>
                        </div>
                    )}
                </div>
            </div>

            <Modal
                show={showModal}
                onClose={() => setShowModal(false)}
                title={currentProduct ? "Edit Produk" : "Tambah Produk Baru"}
            >
                <ProductForm
                    product={currentProduct}
                    onSubmit={handleSubmit}
                    onCancel={() => setShowModal(false)}
                    categories={categories}
                />
            </Modal>
        </ShopLayout>
    );
};

export default ManageProducts;