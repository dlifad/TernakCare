import React from "react";
import { Link } from "@inertiajs/react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

const ArticleCard = ({ article }) => {
    const categoryColors = {
        kesehatan: "bg-green-100 text-green-800",
        pakan: "bg-yellow-100 text-yellow-800",
        reproduksi: "bg-purple-100 text-purple-800",
        pemeliharaan: "bg-blue-100 text-blue-800",
        tips: "bg-orange-100 text-orange-800",
    };

    const categoryColor =
        categoryColors[article.category] || "bg-gray-100 text-gray-800";
    const formattedDate = article.created_at
        ? formatDistanceToNow(new Date(article.created_at), {
              addSuffix: true,
              locale: id,
          })
        : "";

    return (
        <Link
            href={route("farmer.articles.show", article.slug)}
            className="block h-full"
        >
            <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="relative h-52">
                    <img
                        src={
                            article.featured_image
                                ? `/storage/${article.featured_image}`
                                : "/images/default-article.jpg"
                        }
                        alt={article.title}
                        className="w-full h-full object-cover"
                    />

                    {article.featured && (
                        <span className="absolute top-3 left-3 bg-primary text-white text-xs px-2 py-1 rounded">
                            Unggulan
                        </span>
                    )}
                </div>

                <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColor}`}
                        >
                            {article.category
                                ? article.category.charAt(0).toUpperCase() +
                                  article.category.slice(1)
                                : "Umum"}
                        </span>
                        <span className="text-xs text-neutral-dark">
                            {formattedDate}
                        </span>
                    </div>

                    <h3 className="text-lg font-semibold text-neutral-darkest mb-2 line-clamp-2">
                        {article.title}
                    </h3>

                    <p className="text-sm text-neutral-dark mb-4 line-clamp-3">
                        {article.excerpt}
                    </p>

                    <div className="mt-auto">
                        <span className="text-primary font-medium text-sm inline-flex items-center">
                            Baca selengkapnya
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 ml-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ArticleCard;
