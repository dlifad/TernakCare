import React, { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import Button from "@/Components/Common/Button";
import InputError from "@/Components/Common/InputError";

const ProductForm = ({ product, onCancel, categories }) => {
    const [imagePreview, setImagePreview] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: product?.name || "",
        description: product?.description || "",
        price: product?.price ? String(product?.price) : "",
        stock: product?.stock ? String(product?.stock) : "",
        category: product?.category || "",
        image: null,
    });

    useEffect(() => {
        if (product) {
            setData({
                name: product.name || "",
                description: product.description || "",
                price: product.price ? String(product.price) : "",
                stock: product.stock ? String(product.stock) : "",
                category: product.category || "",
                image: null,
            });

            if (product.image) {
                setImagePreview(`/storage/${product.image}`);
            }
        } else {
            reset();
            setImagePreview(null);
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("image", file);
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (product) {
            put(route("shop.products.update", product.id), { 
                onSuccess: () => {
                    if (onCancel) onCancel();
                },
                onError: (errors) => {
                    console.error("Error updating product:", errors);
                },
            });
        } else {
            post(route("shop.products.store"), {
                onSuccess: () => {
                    if (onCancel) onCancel();
                },
                onError: (errors) => {
                    console.error("Error adding product:", errors);
                },
            });
        }
    };

    const removeImage = () => {
        setData(prev => ({ ...prev, image: null, remove_image: true }));
        setImagePreview(null);
    };

    return (
        <form onSubmit={handleSubmit} className="m-10">
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
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                            <div className="flex text-sm justify-center">
                                <label
                                    htmlFor="file-upload"
                                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                                >
                                    <span>Ganti foto</span>
                                    <input
                                        id="file-upload"
                                        name="image"
                                        type="file"
                                        className="sr-only"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                    />
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
                                    <input
                                        id="file-upload"
                                        name="image"
                                        type="file"
                                        className="sr-only"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                    />
                                </label>
                                <p className="pl-1 text-neutral">
                                    atau drag and drop
                                </p>
                            </div>
                            <p className="text-xs text-neutral">
                                PNG, JPG, GIF hingga 5MB
                            </p>
                        </div>
                    )}
                </div>

                {errors.image && (
                    <InputError message={errors.image} className="mt-1" />
                )}
            </div>

            <div className="mb-4">
                <label
                    htmlFor="name"
                    className="block text-sm font-medium text-neutral-dark mb-1"
                >
                    Nama Produk
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={data.name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-neutral-light shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    placeholder="Masukkan nama produk"
                />
                {errors.name && (
                    <InputError message={errors.name} className="mt-1" />
                )}
            </div>

            <div className="mb-4">
                <label
                    htmlFor="description"
                    className="block text-sm font-medium text-neutral-dark mb-1"
                >
                    Deskripsi
                </label>
                <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={data.description}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-neutral-light shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    placeholder="Masukkan deskripsi produk"
                />
                {errors.description && (
                    <InputError message={errors.description} className="mt-1" />
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label
                        htmlFor="price"
                        className="block text-sm font-medium text-neutral-dark mb-1"
                    >
                        Harga (Rp)
                    </label>
                    <input
                        type="text"
                        id="price"
                        name="price"
                        value={data.price}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-neutral-light shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                        placeholder="0"
                    />
                    {errors.price && (
                        <InputError message={errors.price} className="mt-1" />
                    )}
                </div>

                <div>
                    <label
                        htmlFor="stock"
                        className="block text-sm font-medium text-neutral-dark mb-1"
                    >
                        Stok
                    </label>
                    <input
                        type="text"
                        id="stock"
                        name="stock"
                        value={data.stock}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-neutral-light shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                        placeholder="0"
                    />
                    {errors.stock && (
                        <InputError message={errors.stock} className="mt-1" />
                    )}
                </div>
            </div>

            <div className="mb-6">
                <label
                    htmlFor="category"
                    className="block text-sm font-medium text-neutral-dark mb-1"
                >
                    Kategori
                </label>
                <select
                    id="category"
                    name="category"
                    value={data.category}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-neutral-light shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                >
                    <option value="">Pilih kategori</option>
                    <option value="Pakan Ternak">Pakan Ternak</option>
                    <option value="Obat & Vitamin">Obat & Vitamin</option>
                    <option value="Peralatan">Peralatan</option>
                </select>
                {errors.category && (
                    <InputError message={errors.category} className="mt-1" />
                )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-lighter">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="bg-white border border-neutral-light text-neutral-dark hover:bg-neutral-lightest"
                    disabled={processing}
                >
                    Batal
                </Button>

                <Button
                    variant="primary"
                    type="submit"
                    className="bg-primary text-white hover:bg-primary-dark"
                    disabled={processing}
                >
                    {processing ? (
                        <>
                            <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            Menyimpan...
                        </>
                    ) : product ? (
                        "Perbarui Produk"
                    ) : (
                        "Simpan Produk"
                    )}
                </Button>
            </div>
        </form>
    );
};

export default ProductForm;