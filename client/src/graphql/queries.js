export const GET_USER = `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      email
      name
      userType
      createdAt
    }
  }
`;

export const GET_JOBS = `
  query GetJobs($filters: JobFilters) {
    getJobs(filters: $filters) {
      id
      employerId
      title
      description
      field
      skills
      type
      location
      createdAt
      active
    }
  }
`;

export const GET_JOB = `
  query GetJob($id: ID!) {
    getJob(id: $id) {
      id
      employerId
      title
      description
      field
      skills
      type
      location
      createdAt
      active
    }
  }
`;

