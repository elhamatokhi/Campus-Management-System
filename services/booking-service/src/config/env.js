import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4003),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL || '',
  userServiceUrl: process.env.USER_SERVICE_URL || 'http://localhost:4001',
  eventServiceUrl: process.env.EVENT_SERVICE_URL || 'http://localhost:4002',
  bookingNotificationFunctionUrl: process.env.BOOKING_NOTIFICATION_FUNCTION_URL || '',
};

