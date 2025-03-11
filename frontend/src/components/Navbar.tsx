import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll event to change navbar background
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" passHref legacyBehavior>
              <a className="flex items-center">
                <span className={`text-2xl font-bold ${isScrolled ? 'text-ecodify-primary' : 'text-white'}`}>Ecodify</span>
              </a>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link href="/" passHref legacyBehavior>
                <a className={`px-3 py-2 rounded-md text-sm font-medium ${isScrolled ? 'text-gray-700 hover:text-ecodify-primary' : 'text-white hover:text-white hover:bg-white/10'}`}>
                  Home
                </a>
              </Link>
              <Link href="/about" passHref legacyBehavior>
                <a className={`px-3 py-2 rounded-md text-sm font-medium ${isScrolled ? 'text-gray-700 hover:text-ecodify-primary' : 'text-white hover:text-white hover:bg-white/10'}`}>
                  About
                </a>
              </Link>
              <Link href="/dashboard" passHref legacyBehavior>
                <a className={`px-4 py-2 rounded-md text-sm font-medium ${isScrolled ? 'bg-ecodify-primary text-white hover:bg-ecodify-secondary' : 'bg-white text-ecodify-primary hover:bg-gray-100'}`}>
                  Dashboard
                </a>
              </Link>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md ${isScrolled ? 'text-gray-700 hover:text-ecodify-primary hover:bg-gray-100' : 'text-white hover:text-white hover:bg-white/10'}`}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg rounded-b-lg">
          <Link href="/" passHref legacyBehavior>
            <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-ecodify-primary hover:bg-gray-50">
              Home
            </a>
          </Link>
          <Link href="/about" passHref legacyBehavior>
            <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-ecodify-primary hover:bg-gray-50">
              About
            </a>
          </Link>
          <Link href="/dashboard" passHref legacyBehavior>
            <a className="block px-3 py-2 rounded-md text-base font-medium text-white bg-ecodify-primary hover:bg-ecodify-secondary">
              Dashboard
            </a>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 