import React, { useState, useEffect } from "react";
import axios from "axios";

const UserCard = ({ user }) => {
    const [isActive, setIsActive] = useState(user.isActive);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setIsActive(user.isActive);
    }, [user]);

    const shouldDisplayCard =
        user.role === "farmer" || user.status === "verified";

    const formattedDate = new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(user.created_at));

    const handleToggleActive = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post(
                `/admin/users/${user.id}/toggle-status`,
                {
                    isActive: !isActive,
                },
            );

            if (response.data.success) {
                setIsActive(!isActive);
            } else {
                setError("Gagal mengubah status.");
            }
        } catch (err) {
            console.error(err);
            setError("Terjadi kesalahan saat mengubah status.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!shouldDisplayCard) return null;

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden border border-neutral-light hover:border-primary-light/50 transition-colors">
            <div className="p-4">
                <div className="flex justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-neutral-darkest">
                            {user.name}
                        </h3>
                        <p className="text-sm text-neutral-dark">
                            {user.email}
                        </p>
                    </div>
                    <div className="flex flex-col items-end">
                        {user.role !== "farmer" && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                                Terverifikasi
                            </span>
                        )}
                        <span className="text-xs text-neutral mt-1">
                            Terdaftar {formattedDate}
                        </span>
                    </div>
                </div>

                {user.specialty && (
                    <p className="mt-1 text-sm text-neutral">
                        <span className="font-medium">Spesialisasi:</span>{" "}
                        {user.specialty}
                    </p>
                )}

                <div className="mt-4 flex flex-col items-end space-y-2">
                    {error && <p className="text-xs text-red-500">{error}</p>}

                    <div className="flex space-x-2">
                        <button
                            onClick={handleToggleActive}
                            disabled={isLoading}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${
                                isActive
                                    ? "bg-danger/10 text-danger hover:bg-danger/20"
                                    : "bg-success/10 text-success hover:bg-success/20"
                            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            {isLoading
                                ? "Memproses..."
                                : isActive
                                  ? "Nonaktifkan"
                                  : "Aktifkan"}
                        </button>

                        <a
                            href={`/admin/users/${user.id}`}
                            className="px-3 py-1 rounded-md text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 inline-block"
                        >
                            Detail
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserCard;
