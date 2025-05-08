// import React, { useState } from 'react';
// import { Link } from '@inertiajs/react';

// export default function NavBar({ user }) {
//     const [isOpen, setIsOpen] = useState(false);
    
//     return (
//         <nav className="bg-white shadow-soft">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                 <div className="flex justify-between h-16">
//                     <div className="flex">
//                         <div className="flex-shrink-0 flex items-center">
//                             <Link href="/">
//                                 <img className="h-10 w-auto" src="/images/logo.png" alt="TernakCare" />
//                             </Link>
//                         </div>
//                     </div>
                    
//                     <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
//                         {user ? (
//                             <>
//                                 <div className="relative">
//                                     <button 
//                                         onClick={() => setIsOpen(!isOpen)}
//                                         className="flex items-center space-x-2 text-neutral-dark hover:text-primary transition duration-150 ease-in-out"
//                                     >
//                                         <span>{user.name}</span>
//                                         <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                                         </svg>
//                                     </button>
                                    
//                                     {isOpen && (
//                                         <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
//                                             <Link 
//                                                 href={`/${user.role}/profile`}
//                                                 className="block px-4 py-2 text-sm text-neutral-dark hover:bg-neutral-lightest"
//                                             >
//                                                 Profil
//                                             </Link>
//                                             <Link 
//                                                 href="/logout" 
//                                                 method="post" 
//                                                 as="button"
//                                                 className="block w-full text-left px-4 py-2 text-sm text-neutral-dark hover:bg-neutral-lightest"
//                                             >
//                                                 Keluar
//                                             </Link>
//                                         </div>
//                                     )}
//                                 </div>
//                             </>
//                         ) : (
//                             <>
//                                 <Link 
//                                     href="/login"
//                                     className="text-neutral-dark hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
//                                 >
//                                     Masuk
//                                 </Link>
//                                 <Link 
//                                     href="/register"
//                                     className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md text-sm font-medium"
//                                 >
//                                     Daftar
//                                 </Link>
//                             </>
//                         )}
//                     </div>
                    
//                     <div className="flex items-center md:hidden">
//                         <button 
//                             onClick={() => setIsOpen(!isOpen)}
//                             className="inline-flex items-center justify-center p-2 rounded-md text-neutral-dark hover:text-primary hover:bg-neutral-lightest focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
//                         >
//                             <span className="sr-only">Open main menu</span>
//                             <svg className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//                             </svg>
//                             <svg className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                             </svg>
//                         </button>
//                     </div>
//                 </div>
//             </div>
            
//             <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
//                 <div className="pt-2 pb-3 space-y-1">
//                     {user ? (
//                         <>
//                             <Link
//                                 href={`/${user.role}/profile`}
//                                 className="block px-3 py-2 text-base font-medium text-neutral-dark hover:text-primary hover:bg-neutral-lightest"
//                             >
//                                 Profil
//                             </Link>
//                             <Link
//                                 href="/logout"
//                                 method="post"
//                                 as="button"
//                                 className="block w-full text-left px-3 py-2 text-base font-medium text-neutral-dark hover:text-primary hover:bg-neutral-lightest"
//                             >
//                                 Keluar
//                             </Link>
//                         </>
//                     ) : (
//                         <>
//                             <Link
//                                 href="/login"
//                                 className="block px-3 py-2 text-base font-medium text-neutral-dark hover:text-primary hover:bg-neutral-lightest"
//                             >
//                                 Masuk
//                             </Link>
//                             <Link
//                                 href="/register"
//                                 className="block px-3 py-2 text-base font-medium text-primary hover:bg-primary-light hover:text-primary-dark"
//                             >
//                                 Daftar
//                             </Link>
//                         </>
//                     )}
//                 </div>
//             </div>
//         </nav>
//     );
// }