import React from 'react';
import { motion } from 'framer-motion';

const HeroSection: React.FC = () => {
  // Handle button click directly
  const handleButtonClick = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500"></div>
      
      {/* Animated Circles (decorative) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute w-96 h-96 rounded-full bg-white/10 blur-xl"
          style={{ top: '10%', left: '15%' }}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.2, 0.3]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
        />
        <motion.div 
          className="absolute w-64 h-64 rounded-full bg-white/10 blur-xl"
          style={{ bottom: '15%', right: '10%' }}
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-white leading-tight mb-6">
            Transform Your Educational Materials with AI-Enhanced Climate Insights
          </h1>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto">
            Make learning more relevant with AI-powered sustainability integration.
          </p>
        </motion.div>
      </div>
      
      {/* Button positioned lower on the page */}
      <div className="absolute z-50" style={{ top: '75%', left: '50%', transform: 'translate(-50%, -50%)' }}>
        <button
          onClick={handleButtonClick}
          className="px-8 py-4 text-lg font-medium text-ecodify-primary bg-white rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-300 cursor-pointer"
        >
          Try Ecodify
        </button>
      </div>
      
      {/* Wave Shape Divider - ensure it doesn't block pointer events */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full pointer-events-none">
          <path 
            fill="#ffffff" 
            fillOpacity="1" 
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default HeroSection; 