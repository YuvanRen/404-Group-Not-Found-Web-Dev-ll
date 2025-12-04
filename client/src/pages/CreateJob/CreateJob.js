import React from 'react';
import { useNavigate } from 'react-router-dom';
import CreateJobForm from '../../components/CreateJobForm';
import './CreateJob.css';

export default function CreateJob() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));

  const handleJobCreated = (newJob) => {
    console.log('Job created successfully:', newJob);
    navigate('/dashboard');
  };

  if (!user || user.userType !== 'employer') {
    return (
      <div className="create-job-page">
        <div className="error-container">
          <h2>Access Denied</h2>
          <p>Only employers can create job postings.</p>
          <button onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="create-job-page">
      <div className="create-job-container">
        <button 
          className="back-button" 
          onClick={() => navigate('/dashboard')}
        >
            Back to Dashboard
        </button>
        <CreateJobForm 
          onJobCreated={handleJobCreated} 
          employerId={user.id} 
        />
      </div>
    </div>
  );
}