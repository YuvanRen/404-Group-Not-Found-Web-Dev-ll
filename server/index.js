import express, { json } from 'express';
import { graphqlHTTP } from 'express-graphql';
import cors from 'cors';
import schema from './graphql/schema';
import resolvers from './graphql/resolvers';
import authRouter from './routes/auth.js';
import { authenticate } from './middleware/auth.js';
import session from 'express-session';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true
  })
);


app.use(json());

app.use(
  session({
    name: 'JobFinderCookie',
    secret: 'some secret string!',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
  })
);

// Public routes for authentication
app.use('/auth', authRouter);

// Protect everything below with authenticate
app.use(authenticate);

// GraphQL endpoint
app.use(
  '/graphql',
  graphqlHTTP((req, res, params) => ({
    schema,
    rootValue: resolvers,
    graphiql: process.env.NODE_ENV !== 'production', // Enable GraphiQL in development
    context: { req },                               // Pass request to context for auth
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
  }))
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
});

