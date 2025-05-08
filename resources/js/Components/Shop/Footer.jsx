import React from 'react';
import { Link } from '@inertiajs/react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-neutral-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                <span className="font-bold text-white text-xs">T</span>
              </div>
              <span className="font-heading font-bold text-neutral-darkest text-lg">
                TernakApp
              </span>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0">
            <p className="text-center md:text-right text-sm text-neutral">
              &copy; {currentYear} TernakApp. All rights reserved.
            </p>
          </div>
        </div>
        
        <div className="mt-4 border-t border-neutral-light pt-4">
          <div className="flex flex-col md:flex-row md:justify-between items-center text-xs text-neutral">
            <div className="flex space-x-4 mb-2 md:mb-0">
              <Link href="/about" className="hover:text-primary">Tentang Kami</Link>
              <Link href="/contact" className="hover:text-primary">Kontak</Link>
              <Link href="/faq" className="hover:text-primary">FAQ</Link>
            </div>
            <div className="flex space-x-4">
              <Link href="/terms" className="hover:text-primary">Syarat & Ketentuan</Link>
              <Link href="/privacy" className="hover:text-primary">Kebijakan Privasi</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;