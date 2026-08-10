import multer from 'multer';
import { env } from '../config/env.js';
import { createHttpError } from '../utils/httpError.js';

const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.maxImageUploadBytes,
  },
  fileFilter(request, file, callback) {
    if (!allowedImageTypes.includes(file.mimetype)) {
      callback(createHttpError(400, 'Unsupported image type. Use jpg, png, or webp.'));
      return;
    }

    callback(null, true);
  },
});
