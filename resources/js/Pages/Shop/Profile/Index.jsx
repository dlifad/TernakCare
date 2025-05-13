import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Clock,
    Camera,
    Save,
    X,
    CreditCard,
    Building,
    Lock,
} from "lucide-react";
import ShopLayout from "@/Layouts/ShopLayout";
import {
    TextInput,
    TextArea,
    PasswordInput,
    FormSection,
} from "@/Components/Form"; // Import komponen form
import Alert from "@/Components/Common/Alert";

export default function ShopProfile({ auth, shop }) {
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // Form untuk edit profil
    const { data, setData, post, processing, errors, reset } = useForm({
        shop_name: shop.shop_name || "",
        owner_name: shop.owner_name || "",
        email: shop.email || "",
        phone: shop.phone || "",
        address: shop.address || "",
        description: shop.description || "",
        operating_hours: shop.operating_hours || "",
        bank_name: shop.bank_name || "",
        account_number: shop.account_number || "",
        account_name: shop.account_name || "",
    });

    // Form untuk ubah password
    const passwordForm = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    // State untuk gambar profil dan banner
    const [profileImage, setProfileImage] = useState(
        shop.shop_logo || "/api/placeholder/100/100",
    );
    const [bannerImage, setBannerImage] = useState(
        shop.shop_banner || "/api/placeholder/800/200",
    );

    // Handler untuk submit form profil
    const handleSubmit = (e) => {
        e.preventDefault();
        post("/shop/profile/update", {
            onSuccess: () => {
                setIsEditing(false);
                setSuccessMessage("Profil berhasil diperbarui");
                setTimeout(() => setSuccessMessage(""), 3000);
            },
        });
    };

    // Handler untuk batalkan edit
    const cancelEdit = () => {
        reset();
        setIsEditing(false);
    };

    // Handler untuk submit form password
    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        passwordForm.post("/shop/password/update", {
            onSuccess: () => {
                setShowPasswordModal(false);
                passwordForm.reset();
                setSuccessMessage("Password berhasil diperbarui");
                setTimeout(() => setSuccessMessage(""), 3000);
            },
        });
    };

    // Handler untuk tutup modal password
    const closePasswordModal = () => {
        setShowPasswordModal(false);
        passwordForm.reset();
        passwordForm.clearErrors();
    };

    return (
        <ShopLayout>
            <Head title="Profil Toko" />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-neutral-darkest">
                            Profil Toko
                        </h1>
                        <p className="text-neutral-dark">
                            Kelola informasi toko dan pengaturan akun Anda
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-neutral-light text-neutral-dark text-sm font-medium rounded-md hover:bg-neutral transition-colors"
                        >
                            <Lock size={16} className="mr-2" />
                            Ubah Password
                        </button>

                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors"
                            >
                                <Save size={16} className="mr-2" />
                                Edit Profil
                            </button>
                        ) : (
                            <div className="flex space-x-2">
                                <button
                                    onClick={cancelEdit}
                                    className="inline-flex items-center px-4 py-2 bg-neutral-light text-neutral-dark text-sm font-medium rounded-md hover:bg-neutral transition-colors"
                                >
                                    <X size={16} className="mr-2" />
                                    Batal
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={processing}
                                    className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors"
                                >
                                    <Save size={16} className="mr-2" />
                                    Simpan
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {successMessage && (
                    <Alert
                        type="success"
                        message={successMessage}
                        className="mb-6"
                    />
                )}

                <div className="bg-white shadow-card rounded-lg overflow-hidden">
                    {/* Banner Image */}
                    <div className="relative h-48 bg-neutral-light">
                        <img
                            src={bannerImage}
                            alt="Toko Banner"
                            className="w-full h-full object-cover"
                        />
                        {isEditing && (
                            <button className="absolute bottom-4 right-4 p-2 bg-white bg-opacity-80 rounded-full shadow-sm text-neutral-dark hover:text-primary">
                                <Camera size={20} />
                            </button>
                        )}
                    </div>

                    {/* Profile Header */}
                    <div className="bg-neutral-lightest p-6">
                        <div className="flex flex-col sm:flex-row items-center">
                            <div className="relative mb-4 sm:mb-0 sm:mr-6">
                                <div className="w-24 h-24 bg-primary-light text-primary border-4 border-white -mt-12 rounded-full flex items-center justify-center text-3xl font-bold overflow-hidden">
                                    <img
                                        src={profileImage}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                {isEditing && (
                                    <button className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-sm text-neutral-dark hover:text-primary">
                                        <Camera size={16} />
                                    </button>
                                )}
                            </div>
                            <div className="sm:ml-6 text-center sm:text-left">
                                <h2 className="text-xl font-bold text-neutral-darkest">
                                    {shop.shop_name}
                                </h2>
                                <p className="text-neutral-dark">
                                    {shop.owner_name}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Profile Content */}
                    {!isEditing ? (
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Store Information */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg border-b border-neutral-light pb-2">
                                        Informasi Toko
                                    </h3>

                                    <div className="flex items-start">
                                        <Building
                                            size={20}
                                            className="mt-1 text-neutral"
                                        />
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-neutral-darkest">
                                                Nama Toko
                                            </p>
                                            <p className="text-sm text-neutral-dark">
                                                {shop.shop_name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <User
                                            size={20}
                                            className="mt-1 text-neutral"
                                        />
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-neutral-darkest">
                                                Nama Pemilik
                                            </p>
                                            <p className="text-sm text-neutral-dark">
                                                {shop.owner_name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <Mail
                                            size={20}
                                            className="mt-1 text-neutral"
                                        />
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-neutral-darkest">
                                                Email
                                            </p>
                                            <p className="text-sm text-neutral-dark">
                                                {shop.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <Phone
                                            size={20}
                                            className="mt-1 text-neutral"
                                        />
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-neutral-darkest">
                                                Nomor Telepon
                                            </p>
                                            <p className="text-sm text-neutral-dark">
                                                {shop.phone || "-"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <MapPin
                                            size={20}
                                            className="mt-1 text-neutral"
                                        />
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-neutral-darkest">
                                                Alamat
                                            </p>
                                            <p className="text-sm text-neutral-dark">
                                                {shop.address || "-"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <Clock
                                            size={20}
                                            className="mt-1 text-neutral"
                                        />
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-neutral-darkest">
                                                Jam Operasional
                                            </p>
                                            <p className="text-sm text-neutral-dark">
                                                {shop.operating_hours || "-"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Bank Information */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg border-b border-neutral-light pb-2">
                                        Informasi Rekening Bank
                                    </h3>

                                    <div className="flex items-start">
                                        <CreditCard
                                            size={20}
                                            className="mt-1 text-neutral"
                                        />
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-neutral-darkest">
                                                Nama Bank
                                            </p>
                                            <p className="text-sm text-neutral-dark">
                                                {shop.bank_name || "-"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <CreditCard
                                            size={20}
                                            className="mt-1 text-neutral"
                                        />
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-neutral-darkest">
                                                Nomor Rekening
                                            </p>
                                            <p className="text-sm text-neutral-dark">
                                                {shop.account_number || "-"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <User
                                            size={20}
                                            className="mt-1 text-neutral"
                                        />
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-neutral-darkest">
                                                Atas Nama
                                            </p>
                                            <p className="text-sm text-neutral-dark">
                                                {shop.account_name || "-"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Shop Description */}
                            <div className="mt-6">
                                <h3 className="font-semibold text-lg border-b border-neutral-light pb-2">
                                    Deskripsi Toko
                                </h3>
                                <p className="mt-3 text-sm text-neutral-dark">
                                    {shop.description ||
                                        "Belum ada deskripsi toko."}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6">
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Shop Information Edit Form */}
                                    <FormSection title="Informasi Toko">
                                        <TextInput
                                            id="shop_name"
                                            label="Nama Toko"
                                            value={data.shop_name}
                                            onChange={(e) =>
                                                setData(
                                                    "shop_name",
                                                    e.target.value,
                                                )
                                            }
                                            icon={
                                                <Building
                                                    size={18}
                                                    className="text-neutral"
                                                />
                                            }
                                            error={errors.shop_name}
                                        />

                                        <TextInput
                                            id="owner_name"
                                            label="Nama Pemilik"
                                            value={data.owner_name}
                                            onChange={(e) =>
                                                setData(
                                                    "owner_name",
                                                    e.target.value,
                                                )
                                            }
                                            icon={
                                                <User
                                                    size={18}
                                                    className="text-neutral"
                                                />
                                            }
                                            error={errors.owner_name}
                                        />

                                        <TextInput
                                            id="email"
                                            label="Email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) =>
                                                setData("email", e.target.value)
                                            }
                                            icon={
                                                <Mail
                                                    size={18}
                                                    className="text-neutral"
                                                />
                                            }
                                            error={errors.email}
                                        />

                                        <TextInput
                                            id="phone"
                                            label="Nomor Telepon"
                                            value={data.phone}
                                            onChange={(e) =>
                                                setData("phone", e.target.value)
                                            }
                                            icon={
                                                <Phone
                                                    size={18}
                                                    className="text-neutral"
                                                />
                                            }
                                            error={errors.phone}
                                        />

                                        <TextArea
                                            id="address"
                                            label="Alamat"
                                            value={data.address}
                                            onChange={(e) =>
                                                setData(
                                                    "address",
                                                    e.target.value,
                                                )
                                            }
                                            rows={3}
                                            icon={
                                                <MapPin
                                                    size={18}
                                                    className="text-neutral"
                                                />
                                            }
                                            error={errors.address}
                                        />

                                        <TextInput
                                            id="operating_hours"
                                            label="Jam Operasional"
                                            value={data.operating_hours}
                                            onChange={(e) =>
                                                setData(
                                                    "operating_hours",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Contoh: 08:00 - 17:00"
                                            icon={
                                                <Clock
                                                    size={18}
                                                    className="text-neutral"
                                                />
                                            }
                                            error={errors.operating_hours}
                                        />
                                    </FormSection>

                                    {/* Bank Information Edit Form */}
                                    <FormSection title="Informasi Rekening Bank">
                                        <TextInput
                                            id="bank_name"
                                            label="Nama Bank"
                                            value={data.bank_name}
                                            onChange={(e) =>
                                                setData(
                                                    "bank_name",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Contoh: BCA, BRI, Mandiri"
                                            icon={
                                                <CreditCard
                                                    size={18}
                                                    className="text-neutral"
                                                />
                                            }
                                            error={errors.bank_name}
                                        />

                                        <TextInput
                                            id="account_number"
                                            label="Nomor Rekening"
                                            value={data.account_number}
                                            onChange={(e) =>
                                                setData(
                                                    "account_number",
                                                    e.target.value,
                                                )
                                            }
                                            error={errors.account_number}
                                        />

                                        <TextInput
                                            id="account_name"
                                            label="Atas Nama"
                                            value={data.account_name}
                                            onChange={(e) =>
                                                setData(
                                                    "account_name",
                                                    e.target.value,
                                                )
                                            }
                                            error={errors.account_name}
                                        />

                                        <TextArea
                                            id="description"
                                            label="Deskripsi Toko"
                                            value={data.description}
                                            onChange={(e) =>
                                                setData(
                                                    "description",
                                                    e.target.value,
                                                )
                                            }
                                            rows={5}
                                            placeholder="Ceritakan tentang toko Anda..."
                                            error={errors.description}
                                        />
                                    </FormSection>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <>
                    <div
                        className="fixed inset-0 bg-neutral-darkest bg-opacity-75 z-40"
                        onClick={closePasswordModal}
                    ></div>
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-card max-w-md w-full">
                            <div className="p-4 border-b border-neutral-light flex justify-between items-center">
                                <h3 className="text-lg font-medium text-neutral-darkest">
                                    Ubah Password
                                </h3>
                                <button
                                    onClick={closePasswordModal}
                                    className="text-neutral hover:text-neutral-dark"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form
                                onSubmit={handlePasswordSubmit}
                                className="p-4"
                            >
                                <div className="space-y-4">
                                    <PasswordInput
                                        id="current_password"
                                        label="Password Saat Ini"
                                        value={
                                            passwordForm.data.current_password
                                        }
                                        onChange={(e) =>
                                            passwordForm.setData(
                                                "current_password",
                                                e.target.value,
                                            )
                                        }
                                        error={
                                            passwordForm.errors.current_password
                                        }
                                        required
                                    />

                                    <PasswordInput
                                        id="password"
                                        label="Password Baru"
                                        value={passwordForm.data.password}
                                        onChange={(e) =>
                                            passwordForm.setData(
                                                "password",
                                                e.target.value,
                                            )
                                        }
                                        error={passwordForm.errors.password}
                                        required
                                    />

                                    <PasswordInput
                                        id="password_confirmation"
                                        label="Konfirmasi Password Baru"
                                        value={
                                            passwordForm.data
                                                .password_confirmation
                                        }
                                        onChange={(e) =>
                                            passwordForm.setData(
                                                "password_confirmation",
                                                e.target.value,
                                            )
                                        }
                                        error={
                                            passwordForm.errors
                                                .password_confirmation
                                        }
                                        required
                                    />
                                </div>

                                <div className="mt-6 flex justify-end space-x-2">
                                    <button
                                        type="button"
                                        onClick={closePasswordModal}
                                        className="px-4 py-2 bg-neutral-light text-neutral-dark text-sm font-medium rounded-md hover:bg-neutral transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={passwordForm.processing}
                                        className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors"
                                    >
                                        Ubah Password
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}
        </ShopLayout>
    );
}
