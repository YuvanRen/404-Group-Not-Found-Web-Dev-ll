import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../graphql/client';
import { GET_JOBS } from '../../graphql/queries';
import JobSeekerDashboard from '../../components/JobSeekerDashboard';
import EmployerDashboard from '../../components/EmployerDashboard';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    field: '',
    searchTerm: '',
    location: '',
    skills: [],
    active: true 
  });
  const dTimeout = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    if (parsedUser.userType === 'employer') {
      loadJobs({ ...filters, employerId: parsedUser.id });
    } else {
      loadJobs();
    }
  }, [navigate]);

  const loadJobs = async (jobFilters = filters, keepScroll = false) => {
    try {
      const scrollPosition = keepScroll ? window.scrollY : 0;
      setLoading(true);
      setError('');
      
      const cleanFilters = {};
      
      if (jobFilters.type) cleanFilters.type = jobFilters.type;
      if (jobFilters.field) cleanFilters.field = jobFilters.field;
      if (jobFilters.searchTerm) cleanFilters.searchTerm = jobFilters.searchTerm;
      if (jobFilters.location) cleanFilters.location = jobFilters.location;
      if (jobFilters.skills && jobFilters.skills.length > 0) {
        cleanFilters.skills = jobFilters.skills;
      }
      if (jobFilters.active !== undefined) {
        cleanFilters.active = jobFilters.active;
      }
      if (jobFilters.employerId) {
        cleanFilters.employerId = jobFilters.employerId;
      }
      
      const data = await client.request(GET_JOBS, {
        filters: cleanFilters,
      });
      setJobs(data.getJobs);
      if (keepScroll) {
        setTimeout(() => window.scrollTo(0, scrollPosition), 0);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to load jobs. Please try again.';
      setError(errorMessage);
      console.error('Error loading jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJobCreated = async () => {
    if (user?.userType === 'employer') {
      await loadJobs({ ...filters, employerId: user.id });
    } else {
      await loadJobs(filters);
    }
  };

  const handleJobUpdated = async () => {
    if (user?.userType === 'employer') {
      await loadJobs({ ...filters, employerId: user.id });
    } else {
      await loadJobs(filters);
    }
  };

  const handleJobDeleted = async () => {
    if (user?.userType === 'employer') {
      await loadJobs({ ...filters, employerId: user.id });
    } else {
      await loadJobs(filters);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'clearAll') {
      const resetFilters = {
        type: '',
        field: '',
        searchTerm: '',
        location: '',
        skills: [],
        active: true
      };
      setFilters(resetFilters);
      loadJobs(resetFilters, true);
      return;
    }
    
    const newFilters = {
      ...filters,
      [name]: value,
    };
    
    setFilters(newFilters);
    
    if (dTimeout.current) {
      clearTimeout(dTimeout.current);
    }
    
    const timeoutD = name === 'searchTerm' || name === 'field' || name === 'location';
    
    if (timeoutD) {
      dTimeout.current = setTimeout(() => {
        loadJobs(newFilters, true);
      }, 500);
    } else {
      loadJobs(newFilters, true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (loading || !user) {
    return (
      <div className="dashboard">
        <div className="container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  // Render different dashboard based on user type
  if (user.userType === 'employer') {
    return (
      <div className="dashboard">
        <EmployerDashboard
          user={user}
          jobs={jobs}
          loading={loading}
          error={error}
          onJobCreated={handleJobCreated}
          onJobUpdated={handleJobUpdated}
          onJobDeleted={handleJobDeleted}
        />
        <div className="dashboard-footer">
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Job Seeker Dashboard
  return (
    <div className="dashboard">
      <JobSeekerDashboard
        user={user}
        jobs={jobs}
        filters={filters}
        loading={loading}
        error={error}
        onFilterChange={handleFilterChange}
      />
      <div className="dashboard-footer">
        <button className="btn btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
