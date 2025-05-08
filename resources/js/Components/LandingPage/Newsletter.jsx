// resources/js/Components/Newsletter.jsx
import React, { useState } from 'react';
import Button from '@/Components/LandingPage/Button';

export default function Newsletter({ className = '' }) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Simulate API call
        if (email) {
            // Here you would normally send the email to your backend
            setStatus('success');
            setEmail('');
            setTimeout(() => {
                setStatus(null);
            }, 3000);
        }
    };

    return (
        <div className={`bg-white rounded-xl shadow-custom p-6 ${className}`}>
            <h3 className="text-xl font-bold text-text-dark mb-2">Newsletter</h3>
            <p className="text-gray-600 mb-4">
                Dapatkan info terbaru dan tips perawatan ternak langsung ke inbox Anda
            </p>
            
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <input
                        type="email"
                        className="w-full rounded-md border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                        placeholder="Email Anda"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                
                <Button type="submit" variant="primary" className="w-full">
                    Berlangganan
                </Button>
                
                {status === 'success' && (
                    <p className="mt-2 text-sm text-green-600">
                        Terima kasih telah berlangganan!
                    </p>
                )}
            </form>
        </div>
    );
}