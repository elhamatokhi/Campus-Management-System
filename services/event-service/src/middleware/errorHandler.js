import { env } from '../config/env.js';

function redactMessage(message = '') {
  return String(message)
    .replace(/postgres(?:ql)?:\/\/\S+/gi, 'postgresql://[redacted]')
    .replace(/AccountKey=[^;]+/gi, 'AccountKey=[redacted]')
    .replace(/sig=[^&\s]+/gi, 'sig=[redacted]');
}

function logServerError(error, request, statusCode) {
  if (statusCode < 500) return;

  console.error('Unhandled request error', {
    service: 'event-service',
    method: request.method,
    path: request.originalUrl,
    name: error.name,
    code: error.code,
    statusCode,
    message: redactMessage(error.message),
  });
}

export function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    next(error);
    return;
  }

  const statusCode = error.code === 'LIMIT_FILE_SIZE' ? 400 : error.statusCode || 500;
  logServerError(error, request, statusCode);

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
