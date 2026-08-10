import { env } from '../config/env.js';

export function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    next(error);
    return;
  }

  const statusCode = error.statusCode || 500;

  response.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal server error' : error.message,
    ...(env.nodeEnv === 'development' && { details: error.message }),
  });
}

