import React from "react";
import { Head, Link } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { ArrowLeft, Calendar, User, Tag, Star, Edit } from "lucide-react";

export default function Show({ article }) {
    return (
        <AdminLayout>
            <Head title={article.title} />

            <div className="py-4">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center">
                            <Link
                                href={route("admin.articles.index")}
                                className="flex items-center text-neutral-dark hover:text-primary mr-4"
                            >
                                <ArrowLeft className="w-5 h-5 mr-1" />
                                <span>Kembali</span>
                            </Link>
                            <h1 className="text-2xl font-semibold text-neutral-darkest">
                                {article.title}
                            </h1>
                        </div>

                        <Link
                            href={route("admin.articles.edit", article.id)}
                            className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Artikel
                        </Link>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-neutral-dark">
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    <span>
                                        Dibuat:{" "}
                                        {new Date(
                                            article.created_at,
                                        ).toLocaleDateString("id-ID")}
                                    </span>
                                </div>

                                {article.updated_at &&
                                    article.updated_at !==
                                        article.created_at && (
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-1" />
                                            <span>
                                                Diperbarui:{" "}
                                                {new Date(
                                                    article.updated_at,
                                                ).toLocaleDateString("id-ID")}
                                            </span>
                                        </div>
                                    )}

                                {article.user && (
                                    <div className="flex items-center">
                                        <User className="w-4 h-4 mr-1" />
                                        <span>
                                            Penulis: {article.user.name}
                                        </span>
                                    </div>
                                )}

                                {article.category && (
                                    <div className="flex items-center">
                                        <Tag className="w-4 h-4 mr-1" />
                                        <span>
                                            Kategori: {article.category}
                                        </span>
                                    </div>
                                )}

                                {article.featured && (
                                    <div className="flex items-center">
                                        <Star className="w-4 h-4 mr-1 text-yellow-500" />
                                        <span>Artikel Unggulan</span>
                                    </div>
                                )}

                                <div className="px-3 py-1 rounded-full text-xs font-medium bg-neutral-light">
                                    {article.is_published
                                        ? "Terpublikasi"
                                        : "Draft"}
                                </div>
                            </div>

                            {article.featured_image && (
                                <div className="mb-6">
                                    <img
                                        src={`/storage/${article.featured_image}`}
                                        alt={article.title}
                                        className="w-full h-auto max-h-96 object-cover rounded-lg"
                                    />
                                </div>
                            )}

                            <div className="prose max-w-none">
                                {article.content
                                    .split("\n")
                                    .map((paragraph, index) => (
                                        <p key={index}>{paragraph}</p>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
