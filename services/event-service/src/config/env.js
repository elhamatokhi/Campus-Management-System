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
  port: Number(process.env.PORT || 4002),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  databaseUrl: process.env.DATABASE_URL || '',
  azureStorageConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || '',
  azureStorageContainerName: process.env.AZURE_STORAGE_CONTAINER_NAME || 'event-images',
  maxImageUploadBytes: Number(process.env.MAX_IMAGE_UPLOAD_BYTES || 5 * 1024 * 1024),
};
