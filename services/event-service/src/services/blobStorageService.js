import { BlobServiceClient } from '@azure/storage-blob';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { env } from '../config/env.js';
import { createHttpError } from '../utils/httpError.js';

function getBlobExtension(file) {
  const originalExtension = extname(file.originalname || '').toLowerCase();

  if (['.jpg', '.jpeg', '.png', '.webp'].includes(originalExtension)) {
    return originalExtension;
  }

  const mimeExtensions = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
  };

  return mimeExtensions[file.mimetype] || '';
}

export async function uploadEventImage(file) {
  if (!file) {
    throw createHttpError(400, 'Image file is required');
  }

  if (!env.azureStorageConnectionString || !env.azureStorageContainerName) {
    throw createHttpError(
      500,
      'Azure Blob Storage is not configured. Set AZURE_STORAGE_CONNECTION_STRING and AZURE_STORAGE_CONTAINER_NAME.',
      { expose: true },
    );
  }

  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(env.azureStorageConnectionString);
    const containerClient = blobServiceClient.getContainerClient(env.azureStorageContainerName);
    await containerClient.createIfNotExists();

    const blobName = `events/${Date.now()}-${randomUUID()}${getBlobExtension(file)}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: {
        blobContentType: file.mimetype,
      },
    });

    return {
      imageUrl: blockBlobClient.url,
      blobName,
    };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    throw createHttpError(500, 'Azure image upload failed', { expose: true });
  }
}
