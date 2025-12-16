import { buildSchema } from 'graphql';

const schema = buildSchema(`
  type User {
    id: ID!
    email: String!
    name: String!
    userType: String!
    createdAt: String!
  }

  type Job {
    id: ID!
    employerId: ID!
    title: String!
    description: String!
    field: String!
    skills: [String!]!
    type: String!
    location: String
    applyLink: String!
    createdAt: String!
    active: Boolean!
    updatedAt: String
  }

  type AuthPayload {
    user: User!
    token: String
  }

  input UserInput {
    email: String!
    password: String!
    name: String!
    userType: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input JobInput {
    employerId: ID!
    title: String!
    description: String!
    field: String!
    skills: [String!]
    type: String
    location: String
    applyLink: String!
  }

  input JobUpdateInput {
    title: String
    description: String
    field: String
    skills: [String!]
    type: String
    location: String
    active: Boolean
    applyLink: String!
  }
  
  input JobFilters {
    type: String
    field: String
    employerId: ID
    skills: [String!]
    location: String
    active: Boolean
    searchTerm: String
  }

  type Query {
    getUser(id: ID!): User
    getJobs(filters: JobFilters): [Job!]!
    getJob(id: ID!): Job
  }

  type Mutation {
    signup(input: UserInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    createJob(input: JobInput!): Job!
    updateJob(id: ID!, input: JobUpdateInput!): Job!
    deleteJob(id: ID!): Job!
  }
`);

export default schema;

