import { Prisma, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { signAuthToken } from './authService.js';
import { createHttpError } from '../utils/httpError.js';

export function publicUserSelect() {
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

export async function registerUserRecord(payload = {}) {
  const name = String(payload.name || '').trim();
  const email = normalizeEmail(payload.email);
  const password = String(payload.password || '');
  const role = UserRole.STUDENT;

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

export async function loginUserRecord(payload = {}) {
  const email = normalizeEmail(payload.email);
  const password = String(payload.password || '');

  if (!email || !email.includes('@')) {
    throw createHttpError(400, 'A valid email is required');
  }
  if (!password) {
    throw createHttpError(400, 'password is required');
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw createHttpError(401, 'Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw createHttpError(401, 'Invalid email or password');
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return {
    user: safeUser,
    token: signAuthToken(safeUser),
  };
}

export async function getCurrentUserRecord(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect(),
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  return user;
}

export async function updateCurrentUserRecord(userId, payload = {}) {
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
      where: { id: userId },
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
