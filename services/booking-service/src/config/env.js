import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const configDir = dirname(fileURLToPath(import.meta.url));
const serviceEnvPath = resolve(configDir, '../../.env');
const rootEnvPath = resolve(configDir, '../../../../.env');

dotenv.config({ path: rootEnvPath, quiet: true });
dotenv.config({ path: serviceEnvPath, quiet: true });

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4003),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  databaseUrl: process.env.DATABASE_URL || '',
  userServiceUrl: process.env.USER_SERVICE_URL || 'http://localhost:4001',
  eventServiceUrl: process.env.EVENT_SERVICE_URL || 'http://localhost:4002',
  bookingNotificationStorageConnectionString:
    process.env.BOOKING_NOTIFICATION_STORAGE_CONNECTION_STRING || '',
  bookingNotificationQueue: process.env.BOOKING_NOTIFICATION_QUEUE || 'booking-notifications',
};
