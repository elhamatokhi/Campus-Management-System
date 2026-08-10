import { Prisma, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { createHttpError } from '../utils/httpError.js';

function publicUserSelect() {
  return {
    id: true,
    name: true,
    email: true,
    role: true,
    createdAt: true,
    updatedAt: true,
  };
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function getUserWhere(query = {}, body = {}) {
  const id = query.id || body.id;
  const email = query.email || body.email;

  if (id) {
    return { id: String(id) };
  }

  if (email) {
    return { email: normalizeEmail(email) };
  }

  throw createHttpError(400, 'Provide id or email until JWT authentication is added in Phase 7');
}

export async function registerUserRecord(payload = {}) {
  const name = String(payload.name || '').trim();
  const email = normalizeEmail(payload.email);
  const password = String(payload.password || '');
  const role = payload.role === UserRole.ADMIN ? UserRole.ADMIN : UserRole.STUDENT;

  if (!name) {
    throw createHttpError(400, 'name is required');
  }
  if (!email || !email.includes('@')) {
    throw createHttpError(400, 'A valid email is required');
  }
  if (password.length < 8) {
    throw createHttpError(400, 'password must be at least 8 characters');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    return await prisma.user.create({
      data: { name, email, passwordHash, role },
      select: publicUserSelect(),
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw createHttpError(409, 'Email is already registered');
    }
    throw error;
  }
}

export function loginUserPending(payload) {
  return {
    success: false,
    message:
      'Login route is available, but JWT authentication will be implemented in Phase 7. Registration and profile persistence are database-backed now.',
    endpoint: 'POST /api/users/login',
    receivedFields: Object.keys(payload || {}),
  };
}

export async function getCurrentUserRecord(query = {}) {
  const user = await prisma.user.findUnique({
    where: getUserWhere(query),
    select: publicUserSelect(),
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  return user;
}

export async function updateCurrentUserRecord(query = {}, payload = {}) {
  const data = {};

  if (payload.name !== undefined) {
    data.name = String(payload.name).trim();
    if (!data.name) {
      throw createHttpError(400, 'name cannot be empty');
    }
  }

  if (payload.email !== undefined) {
    data.email = normalizeEmail(payload.email);
    if (!data.email || !data.email.includes('@')) {
      throw createHttpError(400, 'A valid email is required');
    }
  }

  if (Object.keys(data).length === 0) {
    throw createHttpError(400, 'At least one profile field is required');
  }

  try {
    return await prisma.user.update({
      where: getUserWhere(query, payload),
      data,
      select: publicUserSelect(),
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw createHttpError(404, 'User not found');
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw createHttpError(409, 'Email is already registered');
    }
    throw error;
  }
}
