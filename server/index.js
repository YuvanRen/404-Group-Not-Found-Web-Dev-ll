import express, { json } from 'express';
import { graphqlHTTP } from 'express-graphql';
import cors from 'cors';
import session from 'express-session';
import {RedisStore} from 'connect-redis';
import redisClient from './config/redisConnection.js';
import schema from './graphql/schema.js';
import resolvers from './graphql/resolvers.js';
import authRouter from './routes/auth.js';
import { authenticate } from './middleware/auth.js';
import resumeRouter from "./routes/resume.js";

const app = express();
const PORT = process.env.PORT || 4000;

async function startServer() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

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
      store: new RedisStore({ client: redisClient }),
      secret: process.env.SESSION_SECRET || 'some secret string!',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
      },
    })
  );

  // Public routes for authentication
  app.use('/auth', authRouter);

  // Protected resume routes
  app.use("/resume", authenticate, resumeRouter);

  // GraphQL endpoint
  app.use(
    '/graphql',
    graphqlHTTP((req, res, params) => ({
      schema,
      rootValue: resolvers,
      graphiql: process.env.NODE_ENV !== 'production',
      context: {
        req,
        res,
        user: req.session?.user || null,  
      },
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
  app.get('/health', async (req, res) => {
    const redisStatus = redisClient.isOpen ? 'connected' : 'disconnected';
    res.json({
      status: 'ok',
      message: 'Server is running',
      redis: redisStatus,
    });
  });

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
    console.log(`Redis session store: connected`);
  });
}

// Start the server
startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});