import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

function Landing() {
  const navigate = useNavigate();

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

