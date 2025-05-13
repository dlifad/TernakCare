import React from "react";
import { formatRupiah } from "@/Components/Common/format";

export default function ServiceToggleCard({
    enabled,
    onToggle,
    icon: Icon,
    title,
    description,
    price,
    onPriceChange,
}) {
    const handleToggle = (e) => {
        e.preventDefault();
        onToggle();
    };
    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                    <div
                        className={`p-2 rounded-lg ${enabled ? "bg-primary/10" : "bg-neutral-light"}`}
                    >
                        <Icon
                            size={24}
                            className={
                                enabled ? "text-primary" : "text-neutral"
                            }
                        />
                    </div>
                    <div>
                        <h3 className="font-medium text-neutral-darkest">
                            {title}
                        </h3>
                        <p className="text-sm text-neutral-dark">
                            {description}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onToggle}
                    className={`
            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 
            border-transparent transition-colors duration-200 ease-in-out 
            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
            ${enabled ? "bg-primary" : "bg-neutral"}
          `}
                >
                    <span
                        className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full 
            bg-white shadow ring-0 transition duration-200 ease-in-out
            ${enabled ? "translate-x-5" : "translate-x-0"}
          `}
                    />
                </button>
            </div>

            {enabled && (
                <div className="mt-4 border-t pt-4">
                    <label className="block">
                        <span className="text-sm font-medium text-neutral-darkest">
                            Tarif Konsultasi
                        </span>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-neutral-dark sm:text-sm">
                                    Rp
                                </span>
                            </div>
                            <input
                                type="number"
                                value={price || ""}
                                onChange={(e) => onPriceChange(e.target.value)}
                                className="
                  block w-full pl-12 pr-4 py-2 sm:text-sm border-neutral 
                  focus:ring-primary focus:border-primary rounded-md
                "
                                placeholder="0"
                                min="0"
                                step="1000"
                            />
                        </div>
                    </label>
                </div>
            )}
        </div>
    );
}
