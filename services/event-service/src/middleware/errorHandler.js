import { env } from '../config/env.js';

export function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    next(error);
    return;
  }

  const statusCode = error.code === 'LIMIT_FILE_SIZE' ? 400 : error.statusCode || 500;

  response.status(statusCode).json({
    success: false,
    message: error.code === 'LIMIT_FILE_SIZE'
      ? 'Image file is too large'
      : error.expose
        ? error.message
        : statusCode === 500
          ? 'Internal server error'
          : error.message,
    ...(env.nodeEnv === 'development' && { details: error.message }),
  });
}
