// resources/js/Components/Card.jsx
import React from 'react';
import { Link } from '@inertiajs/react';
import Button from '@/Components/LandingPage/Button';

export default function Card({ 
    title, 
    description, 
    icon, 
    buttonText, 
    buttonLink, 
    buttonVariant = 'primary', 
    className = '' 
}) {
    return (
        <div className={`bg-white rounded-xl shadow-custom p-6 flex flex-col ${className}`}>
            <div className="text-primary mb-4">
                {icon}
            </div>
            
            <h3 className="text-xl font-bold text-text-dark mb-2">{title}</h3>
            
            <p className="text-gray-600 mb-6 flex-grow">{description}</p>
            
            {buttonText && buttonLink && (
                <div className="mt-auto">
                    <Link href={buttonLink}>
                        <Button variant={buttonVariant}>{buttonText}</Button>
                    </Link>
                </div>
            )}
        </div>
    );
}