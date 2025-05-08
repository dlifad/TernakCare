import React from 'react';

export default function Button({ type = 'button', className = '', disabled, children, variant = 'primary', size = 'md', onClick }) {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-md';
    
    const variantClasses = {
        primary: 'bg-primary hover:bg-primary-dark focus:ring-primary-light text-white',
        secondary: 'bg-secondary hover:bg-secondary-dark focus:ring-secondary-light text-white',
        outline: 'border border-primary text-primary hover:bg-primary-light hover:text-primary-dark focus:ring-primary-light',
        danger: 'bg-danger hover:bg-red-700 focus:ring-red-300 text-white',
        success: 'bg-success hover:bg-green-700 focus:ring-green-300 text-white',
        warning: 'bg-warning hover:bg-yellow-600 focus:ring-yellow-300 text-white',
        neutral: 'bg-neutral hover:bg-neutral-dark focus:ring-neutral-light text-white',
    };
    
    const sizeClasses = {
        xs: 'text-xs px-2 py-1',
        sm: 'text-sm px-3 py-1.5',
        md: 'text-sm px-4 py-2',
        lg: 'text-base px-5 py-2.5',
        xl: 'text-lg px-6 py-3',
    };
    
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
    
    const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;
    
    return (
        <button
            type={type}
            className={buttonClasses}
            disabled={disabled}
            onClick={onClick}
        >
            {children}
        </button>
    );
}