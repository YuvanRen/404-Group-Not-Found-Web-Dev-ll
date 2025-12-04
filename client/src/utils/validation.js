// Validation utility functions

export const validateEmail = (email) => {
  if (!email) {
    return 'Email is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return '';
};

export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters long';
  }
  if (password.length > 100) {
    return 'Password must be less than 100 characters';
  }
  return '';
};

export const validateName = (name) => {
  if (!name) {
    return 'Name is required';
  }
  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters long';
  }
  if (name.trim().length > 100) {
    return 'Name must be less than 100 characters';
  }
  if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) {
    return 'Name can only contain letters, spaces, hyphens, and apostrophes';
  }
  return '';
};

export const validateJobTitle = (title) => {
  if (!title) {
    return 'Job title is required';
  }
  if (title.trim().length < 3) {
    return 'Job title must be at least 3 characters long';
  }
  if (title.trim().length > 200) {
    return 'Job title must be less than 200 characters';
  }
  return '';
};

export const validateJobDescription = (description) => {
  if (!description) {
    return 'Job description is required';
  }
  if (description.trim().length < 10) {
    return 'Job description must be at least 10 characters long';
  }
  if (description.trim().length > 5000) {
    return 'Job description must be less than 5000 characters';
  }
  return '';
};

export const validateJobField = (field) => {
  if (!field) {
    return 'Field is required';
  }
  if (field.trim().length < 2) {
    return 'Field must be at least 2 characters long';
  }
  if (field.trim().length > 100) {
    return 'Field must be less than 100 characters';
  }
  return '';
};

export const validateJobLocation = (location) => {
  if (location && location.trim().length > 200) {
    return 'Location must be less than 200 characters';
  }
  return '';
};

export const validateJobType = (type) => {
  const validTypes = ['full-time', 'part-time', 'contract','internship'];
  if (!type) {
    return 'Job type is required';
  }
  if (!validTypes.includes(type)) {
    return 'Please select a valid job type';
  }
  return '';
};

