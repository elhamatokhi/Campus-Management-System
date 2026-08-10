import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { createHttpError } from '../utils/httpError.js';

export function signAuthToken(user) {
  if (!env.jwtSecret) {
    throw createHttpError(500, 'JWT_SECRET is not configured');
  }

  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
}

export function verifyAuthToken(token) {
  if (!env.jwtSecret) {
    throw createHttpError(500, 'JWT_SECRET is not configured');
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    };
  } catch {
    throw createHttpError(401, 'Invalid or expired token');
  }
}

