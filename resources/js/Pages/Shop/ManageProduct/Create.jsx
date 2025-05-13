import React from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ProductForm from "@/Components/Products/ProductForm";
import { useRouter } from "@inertiajs/react";

const Create = ({ auth }) => {
    const router = useRouter();

    const handleCancel = () => {
        router.visit(route('products.index'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Tambah Produk Baru
                </h2>
            }
        >
            <Head title="Tambah Produk" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <ProductForm onCancel={handleCancel} />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Create;