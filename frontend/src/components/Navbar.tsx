import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const Navbar: React.FC = () => {
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
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-md py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" passHref legacyBehavior>
              <a className={`text-2xl font-display font-bold ${isScrolled ? 'text-ecodify-primary' : 'text-white'}`}>
                Ecodify
              </a>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" passHref legacyBehavior>
              <a className={`font-medium transition-colors ${
                isScrolled ? 'text-gray-700 hover:text-ecodify-primary' : 'text-white/90 hover:text-white'
              }`}>
                Home
              </a>
            </Link>
            <Link href="/about" passHref legacyBehavior>
              <a className={`font-medium transition-colors ${
                isScrolled ? 'text-gray-700 hover:text-ecodify-primary' : 'text-white/90 hover:text-white'
              }`}>
                About
              </a>
            </Link>
            <Link href="/features" passHref legacyBehavior>
              <a className={`font-medium transition-colors ${
                isScrolled ? 'text-gray-700 hover:text-ecodify-primary' : 'text-white/90 hover:text-white'
              }`}>
                Features
              </a>
            </Link>
            <Link href="/dashboard" passHref legacyBehavior>
              <a className={`px-4 py-2 rounded-md font-medium transition-all ${
                isScrolled 
                  ? 'bg-ecodify-primary text-white hover:bg-ecodify-secondary' 
                  : 'bg-white text-ecodify-primary hover:bg-gray-100'
              }`}>
                Try Ecodify
              </a>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isScrolled 
                  ? 'text-gray-700 focus:ring-ecodify-primary' 
                  : 'text-white focus:ring-white'
              }`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 