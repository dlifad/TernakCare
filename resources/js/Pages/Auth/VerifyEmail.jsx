// Simpan ke resources/js/Pages/Auth/VerifyEmail.jsx jika menggunakan React
// atau resources/js/Pages/Auth/VerifyEmail.vue jika menggunakan Vue

// Versi React (JSX)
import React from 'react';
import { useForm, Head, Link } from "@inertiajs/react";
import AuthLayout from '@/Layouts/AuthLayout';
import Button from '@/Components/Common/Button';


export default function VerifyEmail({ status }) {
    const { post, processing } = useForm();

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <AuthLayout>
            <Head title="Verifikasi Email" />

            <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
                <div className="mb-4 text-md text-gray-600 text-justify">
                    Silahkan memverifikasi alamat email Anda dengan
                    mengklik tautan yang baru saja kami kirimkan melalui email kepada Anda. <br></br>Jika Anda tidak menerima email tersebut,
                    kami dengan senang hati akan mengirimkan email lain kepada Anda.
                </div>

                {status === 'verification-link-sent' && (
                    <div className="mb-4 font-medium text-sm text-green-600">
                        Tautan verifikasi baru telah dikirim ke alamat email yang Anda berikan saat pendaftaran.
                    </div>
                )}

                <form onSubmit={submit}>
                    <div className="mt-4 flex items-center justify-between">
                        <Button 
                            type="submit" 
                            variant="primary" 
                            disabled={processing}
                        >
                            Kirim Ulang Email Verifikasi
                        </Button>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="text-sm text-gray-600 hover:text-gray-900 underline"
                        >
                            Keluar
                        </Link>
                    </div>
                </form>
            </div>
        </AuthLayout>
    );
}