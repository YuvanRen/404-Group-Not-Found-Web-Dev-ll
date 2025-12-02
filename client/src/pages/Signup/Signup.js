import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../../graphql/client';
import { SIGNUP } from '../../graphql/mutations';
import { validateEmail, validatePassword, validateName } from '../../utils/validation';
import './Signup.css';

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    userType: 'jobseeker',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    const newErrors = {
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      name: validateName(formData.name),
    };
    
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password && !newErrors.name;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form before submitting
    if (!validateForm()) {
      return;
      }
    
    /* 
    // Original signup code 
    setLoading(true);

    try {
      const data = await client.request(SIGNUP, {
        input: formData,
      });

      // Store token and user data
      localStorage.setItem('authToken', data.signup.token);
      localStorage.setItem('user', JSON.stringify(data.signup.user));

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      let errorMessage = 'Signup failed. Please try again.';
      
      if (err.response?.errors?.[0]?.message) {
        errorMessage = err.response.errors[0].message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Make error messages more user-friendly
      if (errorMessage.includes('already exists')) {
        errorMessage = 'An account with this email already exists. Please use a different email or try logging in.';
      } else if (errorMessage.includes('email')) {
        errorMessage = 'Please enter a valid email address.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
    */
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-card">
          <h1>Create Account</h1>
          <p className="signup-subtitle">Join JobMatch today</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'input-error' : ''}
                required
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'input-error' : ''}
                required
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'input-error' : ''}
                required
                minLength="6"
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
              {!errors.password && formData.password && (
                <span className="field-hint">Password must be at least 6 characters</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="userType">I am a</label>
              <select
                id="userType"
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                required
              >
                <option value="jobseeker">Job Seeker</option>
                <option value="employer">Employer</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="signup-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;

