export const SIGNUP = `
  mutation Signup($input: UserInput!) {
    signup(input: $input) {
      user {
        id
        email
        name
        userType
        createdAt
      }
      token
    }
  }
`;

export const LOGIN = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        id
        email
        name
        userType
        createdAt
      }
      token
    }
  }
`;

export const CREATE_JOB = `
  mutation CreateJob($input: JobInput!) {
    createJob(input: $input) {
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

