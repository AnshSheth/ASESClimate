import React, { useState } from 'react';
import Link from 'next/link';
import './App.css';
import { generatePersonalizedContent } from './services/aiService';

function App() {
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [showInputs, setShowInputs] = useState(false);
  const [userData, setUserData] = useState({
    age: '',
    location: '',
    interests: [],
    learningStyle: ''
  });

  const formatResponse = (text) => {
    return text.split('\n').map((paragraph, index) => {
      const formattedText = paragraph
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/###\s*(.*?)(?=\n|$)/g, '<strong>$1</strong>')
        .replace(/##\s*(.*?)(?=\n|$)/g, '<strong>$1</strong>')
        .replace(/#\s*(.*?)(?=\n|$)/g, '<strong>$1</strong>');
      
      return (
        <p key={index} 
           dangerouslySetInnerHTML={{ __html: formattedText }} 
           className="response-paragraph"
        />
      );
    });
  };

  const generateContent = async () => {
    try {
      setLoading(true);
      const content = await generatePersonalizedContent(userData);
      setAiResponse(content);
      setLoading(false);
    } catch (error) {
      console.error('Error generating content:', error);
      setLoading(false);
    }
  };

  const handleInterestToggle = (interest) => {
    setUserData(prevData => ({
      ...prevData,
      interests: prevData.interests.includes(interest)
        ? prevData.interests.filter(i => i !== interest)
        : [...prevData.interests, interest]
    }));
  };

  return (
    <div className="App">
      <nav className="navbar">
        <h1 className="site-title">EcoLearn<span>.AI</span></h1>
        <div className="nav-links">
          <Link href="/courses">Courses</Link>
          <Link href="/tools">Interactive Tools</Link>
          <Link href="/resources">Teacher Resources</Link>
          <Link href="/about">About</Link>
        </div>
      </nav>

      <div className="course-buttons">
        <button className="course-button">Explore Courses</button>
        <button className="course-button">Individual Impact</button>
        <button className="course-button">Community Efforts</button>
      </div>

      {!showInputs ? (
        <div className="start-section">
          <button 
            className="start-button"
            onClick={() => setShowInputs(true)}
          >
            Start Learning
          </button>
        </div>
      ) : (
        <div className="learning-section">
          <div className="input-section">
            <input
              type="text"
              placeholder="Age"
              value={userData.age}
              onChange={(e) => setUserData({ ...userData, age: e.target.value })}
              className="input-field"
            />
            <input
              type="text"
              placeholder="Location"
              value={userData.location}
              onChange={(e) => setUserData({ ...userData, location: e.target.value })}
              className="input-field"
            />
            <select
              value={userData.learningStyle}
              onChange={(e) => setUserData({ ...userData, learningStyle: e.target.value })}
              className="input-field"
            >
              <option value="">Select Learning Style</option>
              <option value="Visual">Visual</option>
              <option value="Auditory">Auditory</option>
              <option value="Reading/Writing">Reading/Writing</option>
              <option value="Kinesthetic">Kinesthetic</option>
            </select>
          </div>

          <div className="interests-section">
            <h3>Select Your Interests</h3>
            <div className="interests-grid">
              {[
                'Technology', 'Nature', 'Science', 'Arts', 'Sports', 'Music',
                'Gaming', 'Reading', 'Travel', 'Food', 'Fashion', 'History',
                'Animals', 'Space', 'Ocean', 'Engineering', 'Social Media', 'Movies'
              ].map((interest) => (
                <button
                  key={interest}
                  className={`interest-button ${userData.interests.includes(interest) ? 'selected' : ''}`}
                  onClick={() => handleInterestToggle(interest)}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <button 
            className="generate-content-button"
            onClick={generateContent}
            disabled={loading || !userData.age || !userData.location || !userData.learningStyle || userData.interests.length === 0}
          >
            {loading ? 'Generating...' : 'Generate Personalized Content'}
          </button>
        </div>
      )}

      {aiResponse && (
        <div className="response-container">
          <div className="response-box">
            <div className="user-details">
              <p><strong>Age:</strong> {userData.age}</p>
              <p><strong>Location:</strong> {userData.location}</p>
              <p><strong>Interests:</strong> {userData.interests.join(', ')}</p>
              <p><strong>Learning Style:</strong> {userData.learningStyle}</p>
            </div>
            <hr className="details-divider" />
            {formatResponse(aiResponse)}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
