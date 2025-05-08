import React from 'react';

export default function Card({ children, className = '', title, footer, variant = 'default' }) {
    const variantClasses = {
        default: 'bg-white',
        primary: 'bg-primary-light',
        secondary: 'bg-secondary-light',
        neutral: 'bg-neutral-lightest',
    };
    
    return (
        <div className={`rounded-lg shadow-card overflow-hidden ${variantClasses[variant]} ${className}`}>
            {title && (
                <div className="px-6 py-4 border-b border-neutral-light">
                    <h3 className="text-lg font-semibold text-neutral-darkest">{title}</h3>
                </div>
            )}
            
            <div className="p-6">
                {children}
            </div>
            
            {footer && (
                <div className="px-6 py-4 bg-neutral-lightest border-t border-neutral-light">
                    {footer}
                </div>
            )}
        </div>
    );
}