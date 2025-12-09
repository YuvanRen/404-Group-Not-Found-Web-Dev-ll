import React, { useState } from 'react';
import CreateJobForm from './CreateJobForm';
import './EmployerDashboard.css';

function EmployerDashboard({ user, jobs, loading, error, onJobCreated }) {
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="employer-dashboard">
      <div className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <h1>JobMatch Dashboard</h1>
            <div className="header-actions">
              <span className="user-info">Welcome, {user?.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="employer-content">
          {/* User Information Section */}
          <section className="info-section">
            <h2>Your Profile</h2>
            <div className="profile-card">
              <div className="profile-field">
                <label>Name</label>
                <p>{user?.name}</p>
              </div>
              <div className="profile-field">
                <label>Email</label>
                <p>{user?.email}</p>
              </div>
              <div className="profile-field">
                <label>Account Type</label>
                <p className="badge badge-employer">Employer</p>
              </div>
            </div>
          </section>

          {/* Create Job Posting Section */}
          <section className="create-job-section">
            <div className="section-header">
              <h2>Post a New Job</h2>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowCreateForm(!showCreateForm)}
              >
                {showCreateForm ? 'Cancel' : '+ Create Job Posting'}
              </button>
            </div>

            {showCreateForm && (
              <CreateJobForm
                employerId={user?.id}
                onJobCreated={(newJob) => {
                  onJobCreated();
                  setShowCreateForm(false);
                }}
              />
            )}
          </section>

          {/* Job Postings Section */}
          <section className="jobs-section">
            <h2>Your Job Postings</h2>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
              <div className="loading">Loading your jobs...</div>
            ) : jobs.length === 0 ? (
              <div className="no-jobs">
                <p>You haven't created any job postings yet.</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCreateForm(true)}
                >
                  Create Your First Job Posting
                </button>
              </div>
            ) : (
              <div className="jobs-list">
                {jobs.map((job) => (
                  <div key={job.id} className="job-card employer-job-card">
                    <div className="job-header">
                      <div>
                        <h3>{job.title}</h3>
                        <p className="job-status">
                          Status: <span className={job.active ? 'active' : 'inactive'}>
                            {job.active ? 'Active' : 'Inactive'}
                          </span>
                        </p>
                      </div>
                      <div className="job-actions">
                        <button className="btn btn-outline btn-sm">Edit</button>
                        <button className="btn btn-danger btn-sm">Delete</button>
                      </div>
                    </div>
                    <div className="job-meta">
                      <span className="job-type">{job.type}</span>
                      <span className="job-field">{job.field}</span>
                      {job.location && <span className="job-location">{job.location}</span>}
                    </div>
                    <p className="job-description">{job.description}</p>
                    {job.skills && job.skills.length > 0 && (
                      <div className="job-skills">
                        <span className="skills-label">Required Skills:</span>
                        <div className="skills-list">
                          {job.skills.map((skill, idx) => (
                            <span key={idx} className="skill-tag">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="job-footer">
                      <span className="job-posted">Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                      <span className="job-applicants">0 Applicants</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default EmployerDashboard;
