// resources/js/Components/Button.jsx
import React from 'react';

export default function Button({ 
    children, 
    variant = 'primary', 
    className = '', 
    type = 'button',
    disabled = false,
    onClick,
    ...props 
}) {
    const baseClasses = 'inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md font-medium focus:outline-none transition ease-in-out duration-150';
    
    const variantClasses = {
        primary: 'bg-primary hover:bg-primary-dark text-white shadow-sm',
        secondary: 'bg-secondary hover:bg-secondary/90 text-white shadow-sm',
        tertiary: 'bg-tertiary hover:bg-tertiary/90 text-text-dark shadow-sm',
        white: 'bg-white hover:bg-gray-50 text-primary border-white shadow-sm',
        outline: 'bg-transparent hover:bg-gray-50 text-primary border border-primary',
    };

    const disabledClasses = disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer';

    return (
        <button
            type={type}
            className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}
            disabled={disabled}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
}