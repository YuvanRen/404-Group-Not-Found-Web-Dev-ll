import React, { useState } from 'react';
import client from '../graphql/client';
import { CREATE_JOB } from '../graphql/mutations';
import './CreateJobForm.css';

function CreateJobForm({ employerId, onJobCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    field: '',
    skills: '',
    type: 'full-time',
    location: '',
  });

  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Job title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.field.trim()) {
      newErrors.field = 'Field is required';
    }

    if (!formData.type) {
      newErrors.type = 'Job type is required';
    }

    if (formData.location && formData.location.length < 2) {
      newErrors.location = 'Location must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const skillsArray = formData.skills
        .split(',')
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0);

      const jobInput = {
        ...formData,
        skills: skillsArray,
        employerId,
      };

      const data = await client.request(CREATE_JOB, {
        input: jobInput,
      });

      setSuccess('Job posting created successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        field: '',
        skills: '',
        type: 'full-time',
        location: '',
      });

      // Notify parent component
      if (onJobCreated) {
        onJobCreated(data.createJob);
      }
    } catch (err) {
      let errorMessage = 'Failed to create job posting. Please try again.';

      if (err.response?.errors?.[0]?.message) {
        errorMessage = err.response.errors[0].message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      console.error('Error creating job:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-job-form-container">
      <form onSubmit={handleSubmit} className="create-job-form">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-group">
          <label htmlFor="title">Job Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={errors.title ? 'input-error' : ''}
            placeholder="e.g., Senior Software Engineer"
            required
          />
          {errors.title && <span className="field-error">{errors.title}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="field">Field *</label>
            <input
              type="text"
              id="field"
              name="field"
              value={formData.field}
              onChange={handleChange}
              className={errors.field ? 'input-error' : ''}
              placeholder="e.g., Software Development"
              required
            />
            {errors.field && <span className="field-error">{errors.field}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="type">Job Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={errors.type ? 'input-error' : ''}
            >
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="internship">Internship</option>
              <option value="contract">Contract</option>
            </select>
            {errors.type && <span className="field-error">{errors.type}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={errors.location ? 'input-error' : ''}
            placeholder="e.g., New York, NY or Remote"
          />
          {errors.location && <span className="field-error">{errors.location}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Job Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={errors.description ? 'input-error' : ''}
            placeholder="Enter detailed job description..."
            rows="6"
            required
          />
          {errors.description && <span className="field-error">{errors.description}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="skills">Required Skills (comma-separated)</label>
          <textarea
            id="skills"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="e.g., React, Node.js, MongoDB, AWS"
            rows="3"
          />
          <small>Separate skills with commas</small>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Job Posting...' : 'Create Job Posting'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateJobForm;
