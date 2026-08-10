import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import eventRoutes from './routes/eventRoutes.js';

const app = express();

app.use(
  cors({
    origin: env.frontendOrigin,
  }),
);
app.use(express.json());

app.get('/health', (request, response) => {
  response.status(200).json({
    success: true,
    service: 'event-service',
    message: 'Event Service is running',
    environment: env.nodeEnv,
  });
});

app.use('/api/events', eventRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

