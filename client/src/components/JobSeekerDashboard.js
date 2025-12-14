import React, { useState } from 'react';
import './JobSeekerDashboard.css';
import { GoogleGenerativeAI } from '@google/generative-ai';


function JobSeekerDashboard({ user, jobs, filters, loading, error, onFilterChange }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [matchingError, setMatchingError] = useState('');
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [apiKey, setApiKey] = useState(localStorage.getItem('googleAiApiKey') || '');

  const handleApiKeyChange = (e) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
    localStorage.setItem('googleAiApiKey', newApiKey);
  };

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type - only accept text files for now
      if (!file.type.includes('text') && !file.name.endsWith('.txt')) {
        setUploadMessage('Please upload a plain text (.txt) file. PDF parsing is not yet implemented.');
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

  const extractSkillsFromResume = async (fileContent) => {
    if (!apiKey) {
      throw new Error('Please enter your Google AI API key first');
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `Extract a list of key technical and soft skills and any keywords from the following resume content:\n\n${fileContent}\n\nProvide the skills as a comma-separated list.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      const skills = text.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
      return skills;
    } catch (error) {
      console.error('Error extracting skills:', error);
      throw new Error('Failed to extract skills from resume');
    }
  };

  // Simple job matching algorithm
  const matchJobsWithSkills = (skills, allJobs) => {
    return allJobs.map(job => {
      const jobSkills = job.skills || [];
      const matchedSkills = skills.filter(skill =>
        jobSkills.some(jobSkill =>
          jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(jobSkill.toLowerCase())
        )
      );

      const matchScore = jobSkills.length > 0
        ? Math.round((matchedSkills.length / jobSkills.length) * 100)
        : Math.round((matchedSkills.length / skills.length) * 100);

      return {
        ...job,
        matchScore: Math.min(matchScore, 100),
        matchedSkills: matchedSkills.slice(0, 5)
      };
    })
    .filter(job => job.matchScore > 20)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setUploadMessage('Please select a file');
      return;
    }

    setUploading(true);
    setMatchingError('');
    
    try {
      const fileContent = await resumeFile.text();

      // Extract skills using LLM (mock implementation)
      const skills = await extractSkillsFromResume(fileContent);
      setExtractedSkills(skills);

      // Match jobs with extracted skills
      const matched = matchJobsWithSkills(skills, jobs);
      setMatchedJobs(matched);

      setUploadMessage('Resume processed successfully!');

      // Reset file input
      const fileInput = document.getElementById('resume-upload');
      if (fileInput) fileInput.value = '';

    } catch (err) {
      setUploadMessage('Failed to process resume. Please try again.');
      console.error('Resume processing error:', err);
    } finally {
      setUploading(false);
    }
    

  };

  const handleManualMatching = () => {
    if (extractedSkills.length === 0) {
      setMatchingError('Please upload a resume first to extract skills');
      return;
    }

    setMatchingLoading(true);
    setMatchingError('');
    try {
      const matched = matchJobsWithSkills(extractedSkills, jobs);
      setMatchedJobs(matched);
    } catch (err) {
      setMatchingError('Failed to find job matches. Please try again.');
      console.error('Job matching error:', err);
    } finally {
      setMatchingLoading(false);
    }
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

          {/* API Key Configuration Section */}
          <section className="info-section">
            <h2>AI Configuration</h2>
            <div className="api-key-section">
              <div className="api-key-form">
                <label htmlFor="api-key-input">
                  Google AI API Key
                  <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="api-key-input"
                  value={apiKey}
                  onChange={handleApiKeyChange}
                  placeholder="Enter your Google AI API key (starts with AIza...)"
                  className="api-key-input"
                />
                <p className="api-key-help">
                  Get your API key from{' '}
                  <a
                    href="https://makersuite.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Google AI Studio
                  </a>
                  . Your key is stored locally in your browser and is not shared with anyone.
                </p>
                {!apiKey && (
                  <div className="api-key-warning">
                    ⚠️ Please enter your API key to use the AI resume analysis feature.
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Resume Upload Section */}
          <section className="info-section">
            <h2>Resume</h2>
            <div className="resume-section">
              <div className="demo-notice">
                <p><strong>Note:</strong> Currently accepts plain text (.txt) files only. PDF parsing will be added later.</p>
              </div>

              <form onSubmit={handleResumeUpload} className="resume-form">
                <div className="file-input-group">
                  <label htmlFor="resume-upload" className="file-label">
                    <span className="upload-icon">📄</span>
                    <span>Select Resume (Plain Text .txt file)</span>
                  </label>
                  <input
                    type="file"
                    id="resume-upload"
                    accept=".txt"
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
                  {uploading ? 'Processing Resume...' : 'Upload & Analyze Resume'}
                </button>
              </form>
              {uploadMessage && (
                <div className={`message ${uploadMessage.includes('successfully') ? 'success' : 'error'}`}>
                  {uploadMessage}
                </div>
              )}
            </div>
          </section>

          {/* Job Matching Section */}
          {extractedSkills.length > 0 && (
            <section className="info-section">
              <h2>AI Job Matching</h2>
              <div className="matching-section">
                <div className="skills-display">
                  <h3>Skills Extracted from Your Resume</h3>
                  <div className="skills-list">
                    {extractedSkills.map((skill, idx) => (
                      <span key={idx} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="matching-controls">
                  <button
                    className="btn btn-primary"
                    onClick={handleManualMatching}
                    disabled={matchingLoading}
                  >
                    {matchingLoading ? 'Finding Matches...' : 'Find Best Job Matches'}
                  </button>
                </div>

                {matchingError && (
                  <div className="error-message">{matchingError}</div>
                )}

                {matchedJobs.length > 0 && (
                  <div className="matched-jobs-section">
                    <h3>Top Job Matches for You</h3>
                    <div className="matched-jobs-list">
                      {matchedJobs.map((job, idx) => (
                        <div key={job.id} className="matched-job-card">
                          <div className="match-score">
                            <span className="match-percentage">{job.matchScore}% Match</span>
                          </div>
                          <div className="job-content">
                            <h4>{job.title}</h4>
                            <div className="job-meta">
                              <span className="job-type">{job.type}</span>
                              <span className="job-field">{job.field}</span>
                              {job.location && <span className="job-location">{job.location}</span>}
                            </div>
                            <p className="job-description">{job.description}</p>
                            {job.matchedSkills && job.matchedSkills.length > 0 && (
                              <div className="matched-skills">
                                <span className="matched-label">Your Matching Skills:</span>
                                <div className="matched-skills-list">
                                  {job.matchedSkills.map((skill, skillIdx) => (
                                    <span key={skillIdx} className="matched-skill-tag">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            <button className="btn btn-outline btn-sm">Apply Now</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Job Postings Section */}
          <section className="jobs-section">
            <h2>Available Jobs</h2>

            {/* Filters */}
            <div className="filters-container">
              <div className="filter-group">
                <label htmlFor="type">Job Type</label>
                <select
                  id="type"
                  name="type"
                  value={filters.type}
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
                  value={filters.field}
                  onChange={onFilterChange}
                  placeholder="e.g., Software, Marketing"
                />
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
                {jobs.map((job) => (
                  <div key={job.id} className="job-card">
                    <div className="job-header">
                      <h3>{job.title}</h3>
                      <button className="btn btn-outline btn-sm">Apply Now</button>
                    </div>
                    <div className="job-meta">
                      <span className="job-type">{job.type}</span>
                      <span className="job-field">{job.field}</span>
                      {job.location && <span className="job-location">{job.location}</span>}
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
