import React, { useState } from 'react';

export function PersonalizedContent({ content }) {
  const [activeSection, setActiveSection] = useState('introduction');

  if (!content) return null;

  return (
    <div className="personalized-content">
      <nav className="content-nav">
        {Object.keys(content).map(section => (
          <button
            key={section}
            className={`nav-button ${activeSection === section ? 'active' : ''}`}
            onClick={() => setActiveSection(section)}
          >
            {section.charAt(0).toUpperCase() + section.slice(1)}
          </button>
        ))}
      </nav>

      <div className="content-display">
        <div className="content-section">
          {content[activeSection]}
        </div>
      </div>
    </div>
  );
} 