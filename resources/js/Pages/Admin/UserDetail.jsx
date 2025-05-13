import React from "react";
import { Head, usePage } from "@inertiajs/react";
import {
    UserCircle,
    Calendar,
    Mail,
    Tag,
    ArrowLeft,
    Check,
    X,
    Phone,
    MapPin,
    Award,
    Store,
    Tractor,
    UserCheck,
    UserX,
} from "lucide-react";
// We'll use the built-in fetch API instead of axios
import { router } from "@inertiajs/react";

export default function UserDetail() {
    const { user } = usePage().props;

    // Ambil status dari relasi sesuai role
    const getInitialStatus = () => {
        if (user.role === "doctor" && user.doctor) {
            return user.doctor.status || "pending";
        } else if (user.role === "shop" && user.shop) {
            return user.shop.status || "pending";
        }
        return null; // Untuk farmer tidak ada status
    };

    const [status, setStatus] = React.useState(getInitialStatus());
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [isActive, setIsActive] = React.useState(user.is_active);

    // Reset status ketika user berubah (untuk memastikan status selalu terkini)
    React.useEffect(() => {
        setStatus(getInitialStatus());
        setIsActive(user.is_active);
    }, [user]);

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case "doctor":
                return "bg-blue-100 text-blue-800";
            case "shop":
                return "bg-amber-100 text-amber-800";
            case "farmer":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case "verified":
                return "bg-green-100 text-green-800";
            case "rejected":
                return "bg-red-100 text-red-800";
            default:
                return "bg-yellow-100 text-yellow-800";
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return isNaN(date.getTime())
            ? "Invalid date"
            : date.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
              });
    };

    const handleApprove = async () => {
        try {
            setIsProcessing(true);

            // Memanggil API endpoint untuk approve user
            const response = await axios.post(
                `/admin/users/${user.id}/approve`,
            );

            if (response.status === 200) {
                setStatus("verified");
                alert(`User ${user.name} telah berhasil disetujui!`);
            }
        } catch (error) {
            console.error("Error approving user:", error);
            alert(`Terjadi kesalahan saat menyetujui user: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        try {
            setIsProcessing(true);

            // Memanggil API endpoint untuk reject user
            const response = await axios.post(`/admin/users/${user.id}/reject`);

            if (response.status === 200) {
                setStatus("rejected");
                alert(`User ${user.name} telah ditolak!`);
            }
        } catch (error) {
            console.error("Error rejecting user:", error);
            alert(`Terjadi kesalahan saat menolak user: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

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

    const handleGoBack = () => {
        router.visit("/admin/dashboard");
    };

    // Fungsi untuk render detail profil berdasarkan tipe user
    const renderProfileDetails = () => {
        if (!user.doctor && !user.shop && !user.farmer) {
            return null;
        }

        switch (user.role) {
            case "doctor":
                return renderDoctorProfile();
            case "shop":
                return renderShopProfile();
            case "farmer":
                return renderFarmerProfile();
            default:
                return null;
        }
    };

    const renderDoctorProfile = () => {
        const doctor = user.doctor;
        if (!doctor) return null;

        return (
            <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    <div className="flex items-center">
                        <Award size={20} className="text-blue-500 mr-2" />
                        Informasi Dokter
                    </div>
                </h2>

                <div className="bg-gray-50 p-4 rounded-lg">
                    {doctor.specialty && (
                        <div className="mb-3">
                            <p className="text-sm text-gray-500">
                                Spesialisasi
                            </p>
                            <p className="font-medium">{doctor.specialty}</p>
                        </div>
                    )}

                    {doctor.license_number && (
                        <div className="mb-3">
                            <p className="text-sm text-gray-500">
                                Nomor Lisensi
                            </p>
                            <p className="font-medium">
                                {doctor.license_number}
                            </p>
                        </div>
                    )}

                    {doctor.practice_address && (
                        <div className="mb-3">
                            <p className="text-sm text-gray-500">
                                Alamat Praktik
                            </p>
                            <p className="font-medium">
                                {doctor.practice_address}
                            </p>
                        </div>
                    )}

                    {doctor.years_experience && (
                        <div className="mb-3">
                            <p className="text-sm text-gray-500">
                                Pengalaman (Tahun)
                            </p>
                            <p className="font-medium">
                                {doctor.years_experience}
                            </p>
                        </div>
                    )}

                    {doctor.rejection_reason && status === "rejected" && (
                        <div className="mb-3 p-3 bg-red-50 border border-red-100 rounded-md">
                            <p className="text-sm text-red-500 font-medium">
                                Alasan Penolakan
                            </p>
                            <p className="text-red-700">
                                {doctor.rejection_reason}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderShopProfile = () => {
        const shop = user.shop;
        if (!shop) return null;

        return (
            <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    <div className="flex items-center">
                        <Store size={20} className="text-amber-500 mr-2" />
                        Informasi Toko
                    </div>
                </h2>

                <div className="bg-gray-50 p-4 rounded-lg">
                    {shop.shop_name && (
                        <div className="mb-3">
                            <p className="text-sm text-gray-500">Nama Toko</p>
                            <p className="font-medium">{shop.shop_name}</p>
                        </div>
                    )}

                    {shop.shop_phone && (
                        <div className="mb-3">
                            <p className="text-sm text-gray-500">
                                Telepon Toko
                            </p>
                            <p className="font-medium">{shop.shop_phone}</p>
                        </div>
                    )}

                    {shop.shop_address && (
                        <div className="mb-3">
                            <p className="text-sm text-gray-500">Alamat Toko</p>
                            <p className="font-medium">{shop.shop_address}</p>
                        </div>
                    )}

                    {shop.shop_description && (
                        <div className="mb-3">
                            <p className="text-sm text-gray-500">
                                Deskripsi Toko
                            </p>
                            <p className="font-medium">
                                {shop.shop_description}
                            </p>
                        </div>
                    )}

                    {shop.owner_id_number && (
                        <div className="mb-3">
                            <p className="text-sm text-gray-500">
                                Nomor Identitas Pemilik
                            </p>
                            <p className="font-medium">
                                {shop.owner_id_number}
                            </p>
                        </div>
                    )}

                    {shop.rejection_reason && status === "rejected" && (
                        <div className="mb-3 p-3 bg-red-50 border border-red-100 rounded-md">
                            <p className="text-sm text-red-500 font-medium">
                                Alasan Penolakan
                            </p>
                            <p className="text-red-700">
                                {shop.rejection_reason}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderFarmerProfile = () => {
        const farmer = user.farmer;
        if (!farmer) return null;

        return (
            <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    <div className="flex items-center">
                        <Tractor size={20} className="text-green-500 mr-2" />
                        Informasi Peternak
                    </div>
                </h2>

                <div className="bg-gray-50 p-4 rounded-lg">
                    {farmer.farm_name && (
                        <div className="mb-3">
                            <p className="text-sm text-gray-500">
                                Nama Peternakan
                            </p>
                            <p className="font-medium">{farmer.farm_name}</p>
                        </div>
                    )}

                    {farmer.farm_location && (
                        <div className="mb-3">
                            <p className="text-sm text-gray-500">
                                Lokasi Peternakan
                            </p>
                            <p className="font-medium">
                                {farmer.farm_location}
                            </p>
                        </div>
                    )}

                    {farmer.farm_size && (
                        <div className="mb-3">
                            <p className="text-sm text-gray-500">
                                Ukuran Peternakan
                            </p>
                            <p className="font-medium">{farmer.farm_size}</p>
                        </div>
                    )}

                    {farmer.years_experience && (
                        <div className="mb-3">
                            <p className="text-sm text-gray-500">
                                Pengalaman (Tahun)
                            </p>
                            <p className="font-medium">
                                {farmer.years_experience}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Render status badge hanya jika user adalah doctor atau shop
    const renderStatusBadge = () => {
        if (user.role !== "doctor" && user.role !== "shop") {
            return null;
        }

        return (
            <span
                className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(status)}`}
            >
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    // Render action buttons hanya untuk doctor dan shop yang statusnya pending
    const renderActionButtons = () => {
        if (
            (user.role !== "doctor" && user.role !== "shop") ||
            status !== "pending"
        ) {
            return null;
        }

        return (
            <div className="ml-auto flex space-x-2">
                <button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className={`px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                    <Check size={16} className="mr-1" />
                    {isProcessing ? "Processing..." : "Approve"}
                </button>
                <button
                    onClick={handleReject}
                    disabled={isProcessing}
                    className={`px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                    <X size={16} className="mr-1" />
                    {isProcessing ? "Processing..." : "Reject"}
                </button>
            </div>
        );
    };

    // Render activation/deactivation button for verified users and farmers
    const renderActivationButton = () => {
        // Only show for verified doctors/shops or farmers
        if (
            (user.role === "doctor" || user.role === "shop") &&
            status !== "verified" &&
            user.role !== "farmer"
        ) {
            return null;
        }

        return (
            <div className="ml-auto">
                <button
                    onClick={handleToggleActive}
                    disabled={isLoading}
                    className={`px-4 py-2 ${isActive ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"} text-white rounded-md transition-colors flex items-center ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                    {isActive ? (
                        <>
                            <UserX size={16} className="mr-1" />
                            {isLoading ? "Memproses..." : "Nonaktifkan"}
                        </>
                    ) : (
                        <>
                            <UserCheck size={16} className="mr-1" />
                            {isLoading ? "Memproses..." : "Aktifkan"}
                        </>
                    )}
                </button>
            </div>
        );
    };

    return (
        <>
            <Head title={`User Detail - ${user.name}`} />

            <div className="py-6 px-4 md:px-8">
                <button
                    onClick={handleGoBack}
                    className="mb-6 flex items-center text-gray-600 hover:text-gray-800"
                >
                    <ArrowLeft size={20} className="mr-1" />
                    Kembali ke Dashboard
                </button>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <UserCircle size={64} className="text-gray-400" />
                            <div className="ml-4">
                                <h1 className="text-2xl font-bold text-gray-800">
                                    {user.name}
                                </h1>
                                <div className="flex items-center mt-1">
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}
                                    >
                                        {user.role.charAt(0).toUpperCase() +
                                            user.role.slice(1)}
                                    </span>
                                    {renderStatusBadge()}
                                </div>
                            </div>

                            {status === "pending"
                                ? renderActionButtons()
                                : renderActivationButton()}
                        </div>
                    </div>

                    {/* User Information */}
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Informasi Pengguna
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center">
                                <Mail
                                    size={20}
                                    className="text-gray-500 mr-2"
                                />
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Email
                                    </p>
                                    <p className="font-medium">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <Calendar
                                    size={20}
                                    className="text-gray-500 mr-2"
                                />
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Tanggal Pendaftaran
                                    </p>
                                    <p className="font-medium">
                                        {formatDate(user.created_at)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <Tag size={20} className="text-gray-500 mr-2" />
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Status Akun
                                    </p>
                                    <p
                                        className={`font-medium ${isActive ? "text-green-600" : "text-red-600"}`}
                                    >
                                        {isActive ? "Aktif" : "Tidak Aktif"}
                                    </p>
                                </div>
                            </div>

                            {user.phone && (
                                <div className="flex items-center">
                                    <Phone
                                        size={20}
                                        className="text-gray-500 mr-2"
                                    />
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            No. Telepon
                                        </p>
                                        <p className="font-medium">
                                            {user.phone}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {user.address && (
                                <div className="flex items-center">
                                    <MapPin
                                        size={20}
                                        className="text-gray-500 mr-2"
                                    />
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Alamat
                                        </p>
                                        <p className="font-medium">
                                            {user.address}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Render Detail Profil Berdasarkan Role */}
                        {renderProfileDetails()}
                    </div>
                </div>
            </div>
        </>
    );
}
