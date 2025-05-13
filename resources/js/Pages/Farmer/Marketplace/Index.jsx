import React from "react";
import { Head, router } from "@inertiajs/react";
import FarmerLayout from "@/Layouts/FarmerLayout";
import MarketplaceCard from "@/Components/Farmer/MarketplaceCard";
import Pagination from "@/Components/Common/Pagination";
import { Search } from "lucide-react";

export default function Marketplace({ products, categories, filters }) {
    const currentPage = products.current_page;
    const sortValue = typeof filters.sort === "string" ? filters.sort : "newest";
    const searchValue = typeof filters.search === "string" ? filters.search : "";
    const selectedCategory = filters.category ?? null;

    const updateQuery = (params = {}) => {
        const query = {
            sort: params.sort ?? sortValue,
            search: params.search ?? searchValue,
            page: params.page ?? currentPage,
            category: params.category ?? selectedCategory ?? "all",
        };

        router.get(route("farmer.marketplace"), query, {
            preserveState: true,
            preserveScroll: true,
        });
    };


    const handleSearch = (e) => {
        e.preventDefault();
        updateQuery({ search: e.target.search.value });
    };

    const handlePageChange = (page) => {
        updateQuery({ page });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const resetFilters = () => {
        router.get(route("farmer.marketplace"), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const renderCategoryButtons = () => (
        <>
            <button
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                    !selectedCategory || selectedCategory === "all" ? "bg-primary text-white" : "bg-neutral-lightest text-neutral-dark hover:bg-neutral-light"
                }`}
                onClick={() => updateQuery({ category: "all" })}
            >
                Semua
            </button>
            {categories.map((category, idx) => (
                <button
                    key={idx}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedCategory === category
                            ? "bg-primary text-white"
                            : "bg-neutral-lightest text-neutral-dark hover:bg-neutral-light"
                    }`}
                    onClick={() => updateQuery({ category })}
                >
                    {category}
                </button>
            ))}
        </>
    );

    const renderProductGrid = () => (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.data.map((product) => (
                    <MarketplaceCard key={product.id} product={product} />
                ))}
            </div>

            <div className="mt-8">
                <Pagination
                    currentPage={products.current_page}
                    lastPage={products.last_page}
                    onChange={handlePageChange}
                />
            </div>
        </>
    );

    const renderEmptyState = () => (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-neutral-light mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-xl font-bold text-neutral-dark mb-2">Tidak ada produk ditemukan</h2>
            <p className="text-neutral mb-4">Coba ubah filter atau kata kunci pencarian Anda</p>
            <button
                onClick={resetFilters}
                className="bg-primary hover:bg-primary-dark text-white rounded-lg px-4 py-2 transition duration-200"
            >
                Reset Pencarian
            </button>
        </div>
    );

    return (
        <FarmerLayout>
            <Head title="Pasar Ternak" />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <h1 className="text-2xl font-bold text-neutral-darkest font-heading mb-4 md:mb-0">
                        Pasar Ternak
                    </h1>

                    <form onSubmit={handleSearch} className="w-full md:w-auto flex">
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                name="search"
                                placeholder="Cari produk..."
                                className="rounded-l-lg border-r-0 border-neutral-light bg-white focus:ring-2 focus:ring-primary focus:border-transparent px-4 py-2 w-full md:w-64 pl-10"
                                defaultValue={searchValue}
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search size={18} className="text-neutral-400" />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="bg-primary hover:bg-primary-dark text-white rounded-r-lg px-4 py-2 transition duration-200"
                        >
                            Cari
                        </button>
                    </form>
                </div>

                <div className="bg-white rounded-lg shadow-card p-4 mb-6">
                    <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
                        <div className="flex flex-wrap gap-2">
                            {renderCategoryButtons()}
                        </div>

                        <div className="flex items-center">
                            <label htmlFor="sort" className="mr-2 text-sm text-neutral-dark">
                                Urutkan:
                            </label>
                            <select
                                id="sort"
                                value={sortValue}
                                onChange={(e) => updateQuery({ sort: e.target.value })}
                                className="rounded border-neutral-light bg-white focus:ring-2 focus:ring-primary focus:border-transparent px-2 py-1"
                            >
                                <option value="newest">Terbaru</option>
                                <option value="oldest">Terlama</option>
                                <option value="price_low">Harga: Rendah ke Tinggi</option>
                                <option value="price_high">Harga: Tinggi ke Rendah</option>
                            </select>
                        </div>
                    </div>
                </div>

                {products.data.length > 0 ? renderProductGrid() : renderEmptyState()}
            </div>
        </FarmerLayout>
    );
}
