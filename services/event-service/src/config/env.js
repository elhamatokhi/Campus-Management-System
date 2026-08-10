import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4002),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL || '',
  azureStorageConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || '',
  azureStorageContainerName: process.env.AZURE_STORAGE_CONTAINER_NAME || 'event-images',
};

