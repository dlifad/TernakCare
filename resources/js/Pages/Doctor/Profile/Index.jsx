import React, { useState } from "react";
import { Head, useForm, router } from "@inertiajs/react";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Clock,
    Award,
    Edit2,
    Save,
    X as CloseIcon,
    Lock,
} from "lucide-react";
import DoctorLayout from "@/Layouts/DoctorLayout";
import {
    TextInput,
    TextArea,
    PasswordInput,
    FormSection,
} from "@/Components/Form";
import { MessageSquare, Video, Car } from "lucide-react";
import ServiceToggleCard from "@/Components/Doctor/ServiceToggleCard";
import Alert from "@/Components/Alert";

export default function DoctorProfile({ auth, doctor }) {
    const [isEditing, setIsEditing] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: doctor.name || "",
        email: doctor.email || "",
        phone: doctor.phone || "",
        address: doctor.address || "",
        license_number: doctor.license_number || "",
        years_experience: doctor.years_experience || 0,
        working_hours: doctor.working_hours || "",
        practice_address: doctor.practice_address || "",
        about: doctor.about || "",
    });

    const passwordForm = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/doctor/profile", {
            onSuccess: () => {
                setIsEditing(false);
                setSuccessMessage("Profil berhasil diperbarui");
                setTimeout(() => setSuccessMessage(""), 3000);
            },
        });
    };

    const cancelEdit = () => {
        reset();
        setIsEditing(false);
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        passwordForm.post("/doctor/password/update", {
            onSuccess: () => {
                setShowPasswordModal(false);
                passwordForm.reset();
                setSuccessMessage("Password berhasil diperbarui");
                setTimeout(() => setSuccessMessage(""), 3000);
            },
        });
    };

    const closePasswordModal = () => {
        setShowPasswordModal(false);
        passwordForm.reset();
        passwordForm.clearErrors();
    };

    const [services, setServices] = useState({
        chat: {
            active: Boolean(doctor.chat_service_active),
            price: doctor.chat_service_fee || 0,
        },
        video: {
            active: Boolean(doctor.video_call_service_active),
            price: doctor.video_call_service_fee || 0,
        },
        visit: {
            active: Boolean(doctor.home_visit_service_active),
            price: doctor.home_visit_service_fee || 0,
        },
    });

    const handleServiceUpdate = async (type, changes) => {
        // Mapping service types ke nama field di database
        const serviceMapping = {
            chat: ["chat_service_active", "chat_service_fee"],
            video: ["video_call_service_active", "video_call_service_fee"],
            visit: ["home_visit_service_active", "home_visit_service_fee"],
        };

        const updatedServices = {
            ...services,
            [type]: {
                ...services[type],
                ...changes,
            },
        };

        setServices(updatedServices);

        try {
            await router.post("/doctor/settings/update", {
                [serviceMapping[type][0]]: updatedServices[type].active,
                [serviceMapping[type][1]]: updatedServices[type].price,
            });
        } catch (error) {
            console.error("Failed to update service settings:", error);
            // Kembalikan state jika update gagal
            setServices(services);
        }
    };

    return (
        <DoctorLayout>
            <Head title="Profil Dokter" />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-neutral-darkest">
                        Profil Dokter
                    </h1>
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
                                className="inline-flex items-center px-4 py-2 bg-secondary text-white text-sm font-medium rounded-md hover:bg-secondary-dark transition-colors"
                            >
                                <Edit2 size={16} className="mr-2" />
                                Edit Profil
                            </button>
                        ) : (
                            <div className="flex space-x-2">
                                <button
                                    onClick={cancelEdit}
                                    className="inline-flex items-center px-4 py-2 bg-neutral-light text-neutral-dark text-sm font-medium rounded-md hover:bg-neutral transition-colors"
                                >
                                    <CloseIcon size={16} className="mr-2" />
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

                <div className="space-y-6">
                      {successMessage && (
                        <Alert
                            type="success"
                            message={successMessage}
                            className="mb-6"
                        />
                      )}
                    <div className="bg-white shadow-card rounded-lg overflow-hidden">
                        {/* Profile Header */}
                        <div className="bg-secondary-light p-6">
                            <div className="flex flex-col sm:flex-row items-center">
                                <div className="w-24 h-24 bg-secondary-dark text-white rounded-full flex items-center justify-center text-3xl font-bold mb-4 sm:mb-0">
                                    {doctor.name?.charAt(0) || "D"}
                                </div>
                                <div className="sm:ml-6 text-center sm:text-left">
                                    <h2 className="text-xl font-bold text-secondary-dark">
                                        Dr. {doctor.name}
                                    </h2>
                                    <p className="text-secondary">
                                        {doctor.specialization}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Profile Content */}
                        {!isEditing ? (
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Personal Information */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg border-b border-neutral-light pb-2">
                                            Informasi Pribadi
                                        </h3>

                                        <div className="flex items-start">
                                            <User
                                                size={20}
                                                className="mt-1 text-neutral"
                                            />
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-neutral-darkest">
                                                    Nama Lengkap
                                                </p>
                                                <p className="text-sm text-neutral-dark">
                                                    Dr. {doctor.name}
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
                                                    {doctor.email}
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
                                                    {doctor.phone || "-"}
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
                                                    {doctor.address || "-"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Professional Information */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg border-b border-neutral-light pb-2">
                                            Informasi Profesional
                                        </h3>

                                        <div className="flex items-start">
                                            <Award
                                                size={20}
                                                className="mt-1 text-neutral"
                                            />
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-neutral-darkest">
                                                    Nomor Lisensi
                                                </p>
                                                <p className="text-sm text-neutral-dark">
                                                    {doctor.license_number ||
                                                        "-"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <Calendar
                                                size={20}
                                                className="mt-1 text-neutral"
                                            />
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-neutral-darkest">
                                                    Pengalaman
                                                </p>
                                                <p className="text-sm text-neutral-dark">
                                                    {(doctor.years_experience ||
                                                        "-") + " tahun"}
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
                                                    Jam Kerja
                                                </p>
                                                <p className="text-sm text-neutral-dark">
                                                    {doctor.working_hours ||
                                                        "-"}
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
                                                    Alamat Praktik
                                                </p>
                                                <p className="text-sm text-neutral-dark">
                                                    {doctor.practice_address ||
                                                        "-"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* About Me */}
                                <div className="mt-6">
                                    <h3 className="font-semibold text-lg border-b border-neutral-light pb-2">
                                        Tentang Saya
                                    </h3>
                                    <p className="mt-3 text-sm text-neutral-dark">
                                        {doctor.about ||
                                            "Belum ada informasi tentang dokter."}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6">
                                <form onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Personal Information Edit Form */}
                                        <FormSection title="Informasi Pribadi">
                                            <TextInput
                                                id="name"
                                                label="Nama Lengkap"
                                                value={data.name}
                                                onChange={(e) =>
                                                    setData(
                                                        "name",
                                                        e.target.value,
                                                    )
                                                }
                                                icon={
                                                    <User
                                                        size={16}
                                                        className="text-neutral"
                                                    />
                                                }
                                                error={errors.name}
                                                required
                                            />

                                            <TextInput
                                                id="email"
                                                label="Email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) =>
                                                    setData(
                                                        "email",
                                                        e.target.value,
                                                    )
                                                }
                                                icon={
                                                    <Mail
                                                        size={16}
                                                        className="text-neutral"
                                                    />
                                                }
                                                error={errors.email}
                                                required
                                            />

                                            <TextInput
                                                id="phone"
                                                label="Nomor Telepon"
                                                value={data.phone}
                                                onChange={(e) =>
                                                    setData(
                                                        "phone",
                                                        e.target.value,
                                                    )
                                                }
                                                icon={
                                                    <Phone
                                                        size={16}
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
                                                        size={16}
                                                        className="text-neutral"
                                                    />
                                                }
                                                error={errors.address}
                                            />
                                        </FormSection>

                                        {/* Professional Information Edit Form */}
                                        <FormSection title="Informasi Profesional">
                                            <TextInput
                                                id="license_number"
                                                label="Nomor Lisensi"
                                                value={data.license_number}
                                                onChange={(e) =>
                                                    setData(
                                                        "license_number",
                                                        e.target.value,
                                                    )
                                                }
                                                icon={
                                                    <Award
                                                        size={16}
                                                        className="text-neutral"
                                                    />
                                                }
                                                error={errors.license_number}
                                                placeholder="Masukkan nomor lisensi praktik"
                                            />

                                            <TextInput
                                                id="years_experience"
                                                label="Pengalaman"
                                                type="number"
                                                value={data.years_experience}
                                                onChange={(e) =>
                                                    setData(
                                                        "years_experience",
                                                        e.target.value,
                                                    )
                                                }
                                                icon={
                                                    <Calendar
                                                        size={16}
                                                        className="text-neutral"
                                                    />
                                                }
                                                placeholder="Jumlah tahun pengalaman"
                                                error={errors.years_experience}
                                            />

                                            <TextInput
                                                id="working_hours"
                                                label="Jam Kerja"
                                                value={data.working_hours}
                                                onChange={(e) =>
                                                    setData(
                                                        "working_hours",
                                                        e.target.value,
                                                    )
                                                }
                                                icon={
                                                    <Clock
                                                        size={16}
                                                        className="text-neutral"
                                                    />
                                                }
                                                placeholder="Contoh: Senin-Jumat, 08:00-17:00"
                                                error={errors.working_hours}
                                            />

                                            <TextArea
                                                id="practice_address"
                                                label="Alamat Praktik"
                                                value={data.practice_address}
                                                onChange={(e) =>
                                                    setData(
                                                        "practice_address",
                                                        e.target.value,
                                                    )
                                                }
                                                icon={
                                                    <MapPin
                                                        size={16}
                                                        className="text-neutral"
                                                    />
                                                }
                                                error={errors.practice_address}
                                                rows={3}
                                                placeholder="Alamat tempat praktik"
                                            />
                                        </FormSection>
                                    </div>

                                    {/* About Me Edit Form */}
                                    <div className="mt-6">
                                        <FormSection title="Tentang Saya">
                                            <TextArea
                                                id="about"
                                                value={data.about}
                                                onChange={(e) =>
                                                    setData(
                                                        "about",
                                                        e.target.value,
                                                    )
                                                }
                                                rows={5}
                                                placeholder="Ceritakan tentang pengalaman profesional Anda..."
                                                error={errors.about}
                                            />
                                        </FormSection>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Layanan Konsultasi Section */}
                    <div className="bg-white shadow-card rounded-lg overflow-hidden p-6">
                        <h2 className="text-lg font-semibold text-neutral-darkest mb-4">
                            Layanan Konsultasi
                        </h2>
                        <div className="space-y-4">
                            <ServiceToggleCard
                                enabled={services.chat.active}
                                onToggle={() =>
                                    handleServiceUpdate("chat", {
                                        active: !services.chat.active,
                                    })
                                }
                                onPriceChange={(value) =>
                                    handleServiceUpdate("chat", {
                                        price: value,
                                    })
                                }
                                price={services.chat.price}
                                icon={MessageSquare}
                                title="Chat Konsultasi"
                                description="Konsultasi melalui pesan teks"
                            />

                            <ServiceToggleCard
                                enabled={services.video.active}
                                onToggle={() =>
                                    handleServiceUpdate("video", {
                                        active: !services.video.active,
                                    })
                                }
                                onPriceChange={(value) =>
                                    handleServiceUpdate("video", {
                                        price: value,
                                    })
                                }
                                price={services.video.price}
                                icon={Video}
                                title="Video Call"
                                description="Konsultasi melalui panggilan video"
                            />

                            <ServiceToggleCard
                                enabled={services.visit.active}
                                onToggle={() =>
                                    handleServiceUpdate("visit", {
                                        active: !services.visit.active,
                                    })
                                }
                                onPriceChange={(value) =>
                                    handleServiceUpdate("visit", {
                                        price: value,
                                    })
                                }
                                price={services.visit.price}
                                icon={Car}
                                title="Kunjungan"
                                description="Kunjungan ke lokasi pasien"
                            />
                        </div>
                    </div>
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
                                    <CloseIcon size={20} />
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
        </DoctorLayout>
    );
}
