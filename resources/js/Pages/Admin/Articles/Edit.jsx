import React from "react";
import { Head, Link } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import ArticleForm from "@/Components/Admin/ArticleForm";
import { ArrowLeft } from "lucide-react";

export default function Edit({ article }) {
    return (
        <AdminLayout>
            <Head title={`Edit Artikel: ${article.title}`} />

            <div className="py-4">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center">
                        <Link
                            href={route("admin.articles.index")}
                            className="flex items-center text-neutral-dark hover:text-primary mr-4"
                        >
                            <ArrowLeft className="w-5 h-5 mr-1" />
                            <span>Kembali</span>
                        </Link>
                        <h1 className="text-2xl font-semibold text-neutral-darkest">
                            Edit Artikel
                        </h1>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <ArticleForm article={article} mode="edit" />
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
