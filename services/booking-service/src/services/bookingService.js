import { BookingStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { createHttpError } from '../utils/httpError.js';

export const plannedBookingFields = ['id', 'userId', 'eventId', 'status', 'createdAt'];

export const plannedBookingRules = [
  'Prevent duplicate bookings for the same user and event',
  'Check event capacity before confirming a booking',
  'Support booking cancellation',
  'Notify the serverless booking notification function after booking creation',
];

const bookingInclude = {
  user: { select: { id: true, name: true, email: true, role: true } },
  event: { select: { id: true, title: true, startDate: true, location: true, capacity: true } },
};

export async function createBookingRecord(payload = {}) {
  const userId = String(payload.userId || '').trim();
  const eventId = String(payload.eventId || '').trim();

  if (!userId) {
    throw createHttpError(400, 'userId is required');
  }
  if (!eventId) {
    throw createHttpError(400, 'eventId is required');
  }

  try {
    return await prisma.booking.create({
      data: { userId, eventId, status: BookingStatus.CONFIRMED },
      include: bookingInclude,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw createHttpError(409, 'User already has a booking for this event');
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      throw createHttpError(400, 'userId or eventId does not reference an existing record');
    }
    throw error;
  }
}

export async function getBookingRecords(query = {}) {
  const where = {};

  if (query.userId) {
    where.userId = String(query.userId);
  }
  if (query.eventId) {
    where.eventId = String(query.eventId);
  }
  if (query.status) {
    const status = String(query.status).toUpperCase();
    if (!Object.values(BookingStatus).includes(status)) {
      throw createHttpError(400, 'status must be CONFIRMED or CANCELLED');
    }
    where.status = status;
  }

  return prisma.booking.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: bookingInclude,
  });
}

export async function getBookingByIdRecord(id) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: bookingInclude,
  });

  if (!booking) {
    throw createHttpError(404, 'Booking not found');
  }

  return booking;
}

export async function cancelBookingRecord(id) {
  try {
    return await prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
      include: bookingInclude,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw createHttpError(404, 'Booking not found');
    }
    throw error;
  }
}
