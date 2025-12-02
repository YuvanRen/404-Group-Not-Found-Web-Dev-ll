const { buildSchema } = require('graphql');

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
    createdAt: String!
    active: Boolean!
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
  }

  input JobFilters {
    type: String
    field: String
    employerId: ID
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
  }
`);

module.exports = schema;

