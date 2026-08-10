import { verifyAuthToken } from '../services/authService.js';
import { createHttpError } from '../utils/httpError.js';

export function requireAuth(request, response, next) {
  const header = request.get('authorization') || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    next(createHttpError(401, 'Missing Bearer token'));
    return;
  }

  try {
    request.user = verifyAuthToken(token);
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(role) {
  return (request, response, next) => {
    if (!request.user) {
      next(createHttpError(401, 'Authentication required'));
      return;
    }

    if (request.user.role !== role) {
      next(createHttpError(403, 'Insufficient permissions'));
      return;
    }

    next();
  };
}

