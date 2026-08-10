import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { createHttpError } from '../utils/httpError.js';

export const plannedEventFields = [
  'id',
  'title',
  'description',
  'category',
  'location',
  'startDate',
  'endDate',
  'capacity',
  'imageUrl',
  'createdAt',
  'updatedAt',
];

function parseDate(value, fieldName) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) {
    throw createHttpError(400, `${fieldName} must be a valid date`);
  }
  return date;
}

function validateEventPayload(payload, partial = false) {
  const data = {};
  const requiredFields = ['title', 'description', 'category', 'location', 'startDate', 'endDate', 'capacity'];

  if (!partial) {
    for (const field of requiredFields) {
      if (payload?.[field] === undefined || payload?.[field] === '') {
        throw createHttpError(400, `${field} is required`);
      }
    }
  }

  for (const field of ['title', 'description', 'category', 'location', 'imageUrl']) {
    if (payload?.[field] !== undefined) {
      data[field] = payload[field] === null ? null : String(payload[field]).trim();
      if (field !== 'imageUrl' && data[field] === '') {
        throw createHttpError(400, `${field} cannot be empty`);
      }
    }
  }

  if (payload?.startDate !== undefined) {
    data.startDate = parseDate(payload.startDate, 'startDate');
  }

  if (payload?.endDate !== undefined) {
    data.endDate = parseDate(payload.endDate, 'endDate');
  }

  if (data.startDate && data.endDate && data.endDate <= data.startDate) {
    throw createHttpError(400, 'endDate must be after startDate');
  }

  if (payload?.capacity !== undefined) {
    const capacity = Number(payload.capacity);
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw createHttpError(400, 'capacity must be a positive integer');
    }
    data.capacity = capacity;
  }

  return data;
}

export async function getEventRecords(query = {}) {
  const where = {};

  if (query.category) {
    where.category = { equals: String(query.category), mode: 'insensitive' };
  }

  if (query.search) {
    const search = String(query.search);
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
    ];
  }

  return prisma.event.findMany({
    where,
    orderBy: { startDate: 'asc' },
    include: { _count: { select: { bookings: true } } },
  });
}

export async function getEventByIdRecord(id) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: { _count: { select: { bookings: true } } },
  });

  if (!event) {
    throw createHttpError(404, 'Event not found');
  }

  return event;
}

export async function createEventRecord(payload) {
  const data = validateEventPayload(payload);
  return prisma.event.create({ data });
}

export async function updateEventRecord(id, payload) {
  const data = validateEventPayload(payload, true);

  if (Object.keys(data).length === 0) {
    throw createHttpError(400, 'At least one event field is required');
  }

  try {
    return await prisma.event.update({ where: { id }, data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw createHttpError(404, 'Event not found');
    }
    throw error;
  }
}

export async function deleteEventRecord(id) {
  try {
    await prisma.event.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw createHttpError(404, 'Event not found');
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      throw createHttpError(409, 'Event cannot be deleted while bookings reference it');
    }
    throw error;
  }
}
