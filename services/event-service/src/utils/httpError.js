export function createHttpError(statusCode, message, options = {}) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.expose = options.expose ?? statusCode < 500;
  return error;
}
