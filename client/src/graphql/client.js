import { GraphQLClient } from 'graphql-request';

const GRAPHQL_ENDPOINT = process.env.REACT_APP_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql';

const client = new GraphQLClient(GRAPHQL_ENDPOINT, {
  credentials: 'include', 
  headers: () => {
    const token = localStorage.getItem('authToken');
    return token ? { authorization: `Bearer ${token}` } : {};
  },
});

export default client;