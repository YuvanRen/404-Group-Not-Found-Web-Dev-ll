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
    loadJobs();
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

  const handleJobCreated = () => {
    loadJobs(filters);
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
/*




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
        />
        <div className="dashboard-footer">
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    );
  }

      <div className="container">
        <div className="dashboard-content">
          <div className="dashboard-sidebar">
            <h2>Filters</h2>
            <div className="filter-group">
              <label htmlFor="type">Job Type</label>
              <select
                id="type"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
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
                onChange={handleFilterChange}
                placeholder="e.g., Software, Marketing"
              />
            </div>
          </div>

          <div className="dashboard-main">
            <div className="dashboard-main-header">
              <h2>
                {user?.userType === 'employer' ? 'Your Job Postings' : 'Available Jobs'}
              </h2>
              {/* TODO: Add job creation form for employers
                  When implementing, uncomment:
                  {user?.userType === 'employer' && (
                    <CreateJobForm onJobCreated={handleJobCreated} employerId={user?.id} />
                  )}
              */
              /*
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            {jobs.length === 0 ? (
              <div className="no-jobs">
                <p>No jobs found. Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="jobs-list">
                {jobs.map((job) => (
                  <div key={job.id} className="job-card">
                    <h3>{job.title}</h3>
                    <div className="job-meta">
                      <span className="job-type">{job.type}</span>
                      <span className="job-field">{job.field}</span>
                      {job.location && <span className="job-location">{job.location}</span>}
                    </div>
                    <p className="job-description">{job.description}</p>
                    {job.skills && job.skills.length > 0 && (
                      <div className="job-skills">
                        {job.skills.map((skill, idx) => (
                          <span key={idx} className="skill-tag">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
*/