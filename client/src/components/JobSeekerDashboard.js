import React, { useState } from 'react';
import './JobSeekerDashboard.css';

function JobSeekerDashboard({ user, jobs, filters, loading, error, onFilterChange }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [skillInput, setSkillInput] = useState('');

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.includes('pdf') && !file.type.includes('document')) {
        setUploadMessage('Please upload a PDF or document file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadMessage('File size must be less than 5MB');
        return;
      }

      setResumeFile(file);
      setUploadMessage('');
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setUploadMessage('Please select a file');
      return;
    }

    setUploading(true);
    try {
      // TODO: Implement resume upload to backend
      // For now, we'll just show a success message
      setUploadMessage('Resume uploaded successfully!');
      setResumeFile(null);

      // Reset file input
      const fileInput = document.getElementById('resume-upload');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setUploadMessage('Failed to upload resume. Please try again.');
      console.error('Resume upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSkillAdd = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      const skill = skillInput.trim();

      if (!filters.skills.includes(skill)) {
        onFilterChange({
          target: {
            name: 'skills',
            value: [...filters.skills, skill]
          }
        });
      }

      setSkillInput('');
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    onFilterChange({
      target: {
        name: 'skills',
        value: filters.skills.filter(skill => skill !== skillToRemove)
      }
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
      target: {
        name: 'clearAll',
        value: true
      }
    });
    setSkillInput('');
  };

  return (
    <div className="job-seeker-dashboard">
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
        <div className="seeker-content">
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
                <p className="badge badge-seeker">Job Seeker</p>
              </div>
            </div>
          </section>

          {/* Resume Upload Section */}
          <section className="info-section">
            <h2>Resume</h2>
            <div className="resume-section">
              <form onSubmit={handleResumeUpload} className="resume-form">
                <div className="file-input-group">
                  <label htmlFor="resume-upload" className="file-label">
                    <span className="upload-icon">📄</span>
                    <span>Select Resume (PDF or Document)</span>
                  </label>
                  <input
                    type="file"
                    id="resume-upload"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeChange}
                    className="file-input"
                  />
                  {resumeFile && <p className="selected-file">{resumeFile.name}</p>}
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!resumeFile || uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload Resume'}
                </button>
              </form>
              {uploadMessage && (
                <div className={`message ${uploadMessage.includes('successfully') ? 'success' : 'error'}`}>
                  {uploadMessage}
                </div>
              )}
            </div>
          </section>

          {/* Job Postings Section */}
          <section className="jobs-section">
            <div className="section-header">
              <h2>Available Jobs</h2>
              <button onClick={handleClearFilters} className="btn btn-outline btn-sm">
                Clear Filters
              </button>
            </div>
            <div className="search-container">
              <input
                type="text"
                name="searchTerm"
                value={filters.searchTerm || ''}
                onChange={onFilterChange}
                placeholder="Search job titles and descriptions..."
                className="search-input"
              />
            </div>

            {/* Filters */}
            <div className="filters-container">
              <div className="filter-group">
                <label htmlFor="type">Job Type</label>
                <select
                  id="type"
                  name="type"
                  value={filters.type || ''}
                  onChange={onFilterChange}
                >
                  <option value="">All Types</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="field">Field</label>
                <input
                  type="text"
                  id="field"
                  name="field"
                  value={filters.field || ''}
                  onChange={onFilterChange}
                  placeholder="e.g., Software, Marketing"
                />
              </div>

              <div className="filter-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={filters.location || ''}
                  onChange={onFilterChange}
                  placeholder="e.g., New York, Remote"
                />
              </div>

              <div className="filter-group filter-group-skills">
                <label htmlFor="skills">Skills (press Enter to add)</label>
                <input
                  type="text"
                  id="skills"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillAdd}
                  placeholder="JavaScript, React..."
                />
                {filters.skills && filters.skills.length > 0 && (
                  <div className="selected-skills">
                    {filters.skills.map((skill, idx) => (
                      <span key={idx} className="skill-chip">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleSkillRemove(skill)}
                          className="skill-remove"
                          aria-label="Remove skill"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
              <div className="loading">Loading jobs...</div>
            ) : jobs.length === 0 ? (
              <div className="no-jobs">
                <p>No jobs found. Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="jobs-list">
                <div className="jobs-count">
                  {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} found
                </div>
                {jobs.map((job) => (
                  <div key={job.id} className="job-card">
                    <div className="job-header">
                      <h3>{job.title}</h3>
                      <button className="btn btn-outline btn-sm">Apply Now</button>
                    </div>
                    <div className="job-meta">
                      <span className="job-type">{job.type}</span>
                      <span className="job-field">{job.field}</span>
                      {job.location && <span className="job-location">📍 {job.location}</span>}
                    </div>
                    <p className="job-description">{job.description}</p>
                    {job.skills && job.skills.length > 0 && (
                      <div className="job-skills">
                        <span className="skills-label">Skills Required:</span>
                        <div className="skills-list">
                          {job.skills.map((skill, idx) => (
                            <span key={idx} className="skill-tag">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
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

export default JobSeekerDashboard;
