import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

function Landing() {
  const navigate = useNavigate();

  const handleTestDashboard = (userType) => {
    // Create mock user data for testing
    const mockUser = {
      id: userType === 'employer' ? 'emp-001' : 'seeker-001',
      name: userType === 'employer' ? 'Test Employer' : 'Test Job Seeker',
      email: userType === 'employer' ? 'employer@test.com' : 'seeker@test.com',
      userType: userType,
      createdAt: new Date().toISOString(),
    };

    // Store in localStorage to simulate login
    localStorage.setItem('authToken', 'test-token-' + userType);
    localStorage.setItem('user', JSON.stringify(mockUser));

    // Navigate to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="landing">
      <div className="landing-hero">
        <div className="container">
          <h1 className="landing-title">JobMatch</h1>
          <p className="landing-subtitle">
            Find your perfect job match with AI-powered recommendations
          </p>
          <div className="landing-buttons">
            <button
              className="btn btn-primary"
              onClick={() => navigate('/signup')}
            >
              Get Started
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
          </div>

          {/* Test Dashboard Buttons */}
          <div className="test-buttons">
            <p className="test-label">Test Dashboards:</p>
            <button
              className="btn btn-test btn-test-seeker"
              onClick={() => handleTestDashboard('jobseeker')}
            >
              Test Job Seeker Dashboard
            </button>
            <button
              className="btn btn-test btn-test-employer"
              onClick={() => handleTestDashboard('employer')}
            >
              Test Employer Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="landing-features">
        <div className="container">
          <h2>Why Choose JobMatch?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>AI-Powered Matching</h3>
              <p>
                Our LLM technology matches your resume with the most relevant job
                postings
              </p>
            </div>
            <div className="feature-card">
              <h3>Verified Employers</h3>
              <p>
                We filter out scams and inactive employers to save you time
              </p>
            </div>
            <div className="feature-card">
              <h3>Smart Filters</h3>
              <p>
                Find jobs by type, field, location, and more with our advanced
                filtering system
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;

