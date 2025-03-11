import React from 'react';

interface SidebarToggleProps {
  isOpen: boolean;
  toggle: () => void;
}

const SidebarToggle: React.FC<SidebarToggleProps> = ({ isOpen, toggle }) => {
  return (
    <button
      onClick={toggle}
      className="fixed md:hidden z-30 bottom-6 right-6 p-3 rounded-full bg-gradient-eco text-white shadow-eco-lg hover:shadow-eco-md focus:outline-none focus:ring-2 focus:ring-ecodify-accent transition-all duration-200 ease-in-out"
      aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        {isOpen ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        )}
      </svg>
    </button>
  );
};

export default SidebarToggle; 