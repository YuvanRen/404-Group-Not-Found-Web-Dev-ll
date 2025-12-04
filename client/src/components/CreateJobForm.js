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
    <div>
      <p>Job creation form - To be implemented</p>
    </div>
  );
}
