import express from 'express';
import cors from 'cors';
import { graphqlHTTP } from 'express-graphql';
import schema from '../graphql/schema.js';
import resolvers from '../graphql/resolvers.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// GraphQL endpoint
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    rootValue: resolvers,
    graphiql: process.env.NODE_ENV !== 'production', // Enable GraphiQL in development
    customFormatErrorFn: (err) => {
      console.error('GraphQL Error:', err);
      console.error('Error message:', err.message);
      console.error('Error locations:', err.locations);
      console.error('Error path:', err.path);
      return {
        message: err.message,
        locations: err.locations,
        path: err.path,
      };
    },
  })
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
});

