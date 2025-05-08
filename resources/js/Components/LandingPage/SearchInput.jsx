// resources/js/Components/SearchInput.jsx
import React, { useState } from 'react';

export default function SearchInput({ placeholder, onSearch, className = '' }) {
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <form onSubmit={handleSubmit} className={`w-full max-w-lg ${className}`}>
            <div className="relative">
                <input
                    type="text"
                    className="w-full rounded-full pl-4 pr-12 py-2 border border-gray-300 focus:ring-primary focus:border-primary bg-gray-50"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button 
                    type="submit" 
                    className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-gray-500 hover:text-primary"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                </button>
            </div>
        </form>
    );
}