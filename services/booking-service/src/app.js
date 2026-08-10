import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import bookingRoutes from './routes/bookingRoutes.js';

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
    service: 'booking-service',
    message: 'Booking Service is running',
    environment: env.nodeEnv,
  });
});

app.use('/api/bookings', bookingRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

