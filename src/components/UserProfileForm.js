import React from 'react';

export function UserProfileForm({ userData, setUserData }) {
  const learningStyles = ["Visual", "Auditory", "Reading/Writing", "Kinesthetic"];
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('Input changed:', name, value); // Debug log
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="user-profile-form">
      <h2>Personalize Your Learning Experience</h2>
      
      <div className="form-group">
        <label htmlFor="age">Age:</label>
        <input
          id="age"
          name="age"
          type="number"
          value={userData.age}
          onChange={handleInputChange}
          min="1"
          max="120"
        />
      </div>

      <div className="form-group">
        <label htmlFor="location">Location (City, Country):</label>
        <input
          id="location"
          name="location"
          type="text"
          value={userData.location}
          onChange={handleInputChange}
          placeholder="e.g., New York, USA"
        />
      </div>

      <div className="form-group">
        <label htmlFor="learningStyle">Preferred Learning Style:</label>
        <select
          id="learningStyle"
          name="learningStyle"
          value={userData.learningStyle}
          onChange={handleInputChange}
        >
          <option value="">Select Style</option>
          {learningStyles.map(style => (
            <option key={style} value={style}>{style}</option>
          ))}
        </select>
      </div>
    </div>
  );
} 