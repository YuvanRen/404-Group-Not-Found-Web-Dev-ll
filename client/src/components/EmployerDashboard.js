import React, { useState } from 'react';
import CreateJobForm from './CreateJobForm';
import client from '../graphql/client';
import { UPDATE_JOB, DELETE_JOB } from '../graphql/queries';
import './EmployerDashboard.css';

function EmployerDashboard({ user, jobs, loading, error, onJobCreated, onJobUpdated, onJobDeleted }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [deletingJobId, setDeletingJobId] = useState(null);

  const handleEditClick = (jobId) => {
    setEditingJobId(jobId);
  };

  const handleCancelEdit = () => {
    setEditingJobId(null);
  };

  const handleUpdateJob = async (jobId, updatedData) => {
    try {
      const cleanId = String(jobId).trim().replace(/['"]/g, '');
      
      console.log('Original job ID:', jobId);
      console.log('Cleaned job ID:', cleanId);
      console.log('ID length:', cleanId.length);
      console.log('Update data:', updatedData);
      
      if (cleanId.length !== 24) {
        throw new Error(`Invalid MongoDB ObjectId length: ${cleanId.length} (expected 24)`);
      }
      
      const response = await client.request(UPDATE_JOB, {
        id: cleanId,
        input: updatedData
      });

      console.log('Update response:', response);
      setEditingJobId(null);
      
      if (onJobUpdated) {
        onJobUpdated();
      }
    } catch (err) {
      console.error('Error updating job:', err);
      console.error('Job ID that failed:', jobId);
      
      let errorMessage = 'Failed to update job. Please try again.';
      if (err.response?.errors?.[0]?.message) {
        errorMessage = err.response.errors[0].message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(errorMessage);
    }
  };

  const handleDeleteClick = async (jobId, jobTitle) => {
    if (deletingJobId === jobId) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete "${jobTitle}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingJobId(jobId);

    try {
      const cleanId = String(jobId).trim().replace(/['"]/g, '');
      
      console.log('Deleting job with ID:', cleanId);
      console.log('ID length:', cleanId.length);
      
      if (cleanId.length !== 24) {
        throw new Error(`Invalid MongoDB ObjectId length: ${cleanId.length} (expected 24)`);
      }
      
      await client.request(DELETE_JOB, { id: cleanId });

      if (onJobDeleted) {
        onJobDeleted();
      }
    } catch (err) {
      console.error('Error deleting job:', err);
      
      let errorMessage = 'Failed to delete job. Please try again.';
      if (err.response?.errors?.[0]?.message) {
        errorMessage = err.response.errors[0].message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(errorMessage);
    } finally {
      setDeletingJobId(null);
    }
  };

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
                    {editingJobId === job.id ? (
                      <EditJobForm
                        job={job}
                        onSave={handleUpdateJob}
                        onCancel={handleCancelEdit}
                      />
                    ) : (
                      <>
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
                            <button 
                              className="btn btn-outline btn-sm"
                              onClick={() => handleEditClick(job.id)}
                              disabled={deletingJobId === job.id}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteClick(job.id, job.title)}
                              disabled={deletingJobId === job.id}
                            >
                              {deletingJobId === job.id ? 'Deleting...' : 'Delete'}
                            </button>
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
                        </div>
                      </>
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

function EditJobForm({ job, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: job.title,
    description: job.description,
    field: job.field,
    skills: job.skills.join(', '),
    type: job.type,
    location: job.location || '',
    applyLink: job.applyLink || '',
    active: job.active
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;  
    setSaving(true);

    try {
      const skillsArray = formData.skills
        .split(',')
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0);

      const updateData = {
        title: formData.title,
        description: formData.description,
        field: formData.field,
        skills: skillsArray,
        type: formData.type,
        location: formData.location,
        applyLink: formData.applyLink,
        active: formData.active
      };

      await onSave(job.id, updateData);
    } catch (err) {
      console.error('Error in form submission:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="edit-job-form">
      <div className="form-group">
        <label>Job Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Field</label>
          <input
            type="text"
            name="field"
            value={formData.field}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Job Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="internship">Internship</option>
            <option value="contract">Contract</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>Application Link</label>
        <input
          type="url"
          name="applyLink"
          value={formData.applyLink}
          onChange={handleChange}
          placeholder="https://company.com/apply"
          required
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          required
        />
      </div>

      <div className="form-group">
        <label>Skills (comma-separated)</label>
        <textarea
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          rows="2"
        />
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="active"
            checked={formData.active}
            onChange={handleChange}
          />
          <span>Active (visible to job seekers)</span>
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button type="button" className="btn btn-outline btn-sm" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default EmployerDashboard;