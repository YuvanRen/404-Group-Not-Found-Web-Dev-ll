import { useState } from 'react';
import client from '../graphql/client';
import { CREATE_JOB } from '../graphql/mutations';
import {
  validateJobTitle,
  validateJobDescription,
  validateJobField,
  validateJobLocation,
  validateJobType
} from '../utils/validation';
import './CreateJobForm.css';

export default function CreateJobForm({ onJobCreated, employerId }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    field: '',
    skills: '',
    type: 'full-time',
    location: ''
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [mutationError, setMutationError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const titleError = validateJobTitle(formData.title);
    if (titleError) newErrors.title = titleError;

    const descError = validateJobDescription(formData.description);
    if (descError) newErrors.description = descError;

    const fieldError = validateJobField(formData.field);
    if (fieldError) newErrors.field = fieldError;

    const typeError = validateJobType(formData.type);
    if (typeError) newErrors.type = typeError;

    if (formData.location) {
      const locationError = validateJobLocation(formData.location);
      if (locationError) newErrors.location = locationError;
    }

    if (!formData.skills || formData.skills.trim() === '') {
      newErrors.skills = 'At least one skill is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setMutationError('');
    if (!validateForm()) {
      return;
    }

    const skillsArray = formData.skills
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill !== '');

    const input = {
      employerId: employerId,
      title: formData.title,
      description: formData.description,
      field: formData.field,
      skills: skillsArray,
      type: formData.type,
      location: formData.location || null
    };

    setLoading(true);

    try {
      const data = await client.request(CREATE_JOB, { input });

      setSuccessMessage('Job posted successfully!');
      setFormData({
        title: '',
        description: '',
        field: '',
        skills: '',
        type: 'full-time',
        location: ''
      });
      setErrors({});

      if (onJobCreated) {
        onJobCreated(data.createJob);
      }

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Job creation error:', error);
      setMutationError(error.message || 'Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-job-form">
      <h2>Create New Job Posting</h2>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      {mutationError && (
        <div className="error-message">
          Error: {mutationError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Job Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Senior Software Engineer"
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <span className="error-text">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Job Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the role, responsibilities, and requirements..."
            rows="6"
            className={errors.description ? 'error' : ''}
          />
          {errors.description && <span className="error-text">{errors.description}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="field">Field *</label>
          <select
            id="field"
            name="field"
            value={formData.field}
            onChange={handleChange}
            className={errors.field ? 'error' : ''}
          >
            <option value="">Select a field</option>
            <option value="Software">Software</option>
            <option value="Hardware">Hardware</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
            <option value="Finance">Finance</option>
            <option value="HR">HR</option>
            <option value="Other">Other</option>
          </select>
          {errors.field && <span className="error-text">{errors.field}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="skills">Required Skills *</label>
          <input
            type="text"
            id="skills"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="Enter required skills"
            className={errors.skills ? 'error' : ''}
          />
          <small>Separate multiple skills with commas</small>
          {errors.skills && <span className="error-text">{errors.skills}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="type">Job Type *</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className={errors.type ? 'error' : ''}
          >
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
          {errors.type && <span className="error-text">{errors.type}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="NYC, Remote, etc."
            className={errors.location ? 'error' : ''}
          />
          {errors.location && <span className="error-text">{errors.location}</span>}
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={loading}
        >
          {loading ? 'Creating Job...' : 'Create Job Posting'}
        </button>
      </form>
    </div>
  );
};