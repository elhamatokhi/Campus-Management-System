import { BookingStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { publishBookingCreatedNotification } from './bookingNotificationQueue.js';
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

const defaultDependencies = {
  prisma,
  publishBookingCreatedNotification,
  logger: console,
};

let dependencies = { ...defaultDependencies };

export function configureBookingServiceDependencies(overrides = {}) {
  dependencies = { ...dependencies, ...overrides };
}

export function resetBookingServiceDependencies() {
  dependencies = { ...defaultDependencies };
}

function isAdmin(user) {
  return user?.role === 'ADMIN';
}

function requireBookingAccess(booking, user) {
  if (!booking) {
    throw createHttpError(404, 'Booking not found');
  }

  if (!isAdmin(user) && booking.userId !== user.id) {
    throw createHttpError(403, 'You can only access your own bookings');
  }
}

function enqueueBookingNotification(booking) {
  void dependencies.publishBookingCreatedNotification(booking, dependencies.logger).catch((error) => {
    dependencies.logger.warn?.('Booking created, but notification enqueue failed', {
      bookingId: booking.id,
      eventId: booking.eventId,
      message: error?.message,
    });
  });
}

export async function createBookingRecord(payload = {}, user) {
  const userId = isAdmin(user) && payload.userId ? String(payload.userId).trim() : user?.id;
  const eventId = String(payload.eventId || '').trim();

  if (!userId) {
    throw createHttpError(401, 'Authentication required');
  }
  if (!eventId) {
    throw createHttpError(400, 'eventId is required');
  }

  const event = await dependencies.prisma.event.findUnique({
    where: { id: eventId },
    include: {
      _count: {
        select: {
          bookings: { where: { status: BookingStatus.CONFIRMED } },
        },
      },
    },
  });

  if (!event) {
    throw createHttpError(404, 'Event not found');
  }

  const existingActiveBooking = await dependencies.prisma.booking.findFirst({
    where: {
      userId,
      eventId,
      status: BookingStatus.CONFIRMED,
    },
  });

  if (existingActiveBooking) {
    throw createHttpError(409, 'User already has an active booking for this event');
  }

  if (event._count.bookings >= event.capacity) {
    throw createHttpError(409, 'Event capacity is full');
  }

  try {
    const booking = await dependencies.prisma.booking.create({
      data: { userId, eventId, status: BookingStatus.CONFIRMED },
      include: bookingInclude,
    });

    enqueueBookingNotification(booking);
    return booking;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      throw createHttpError(400, 'userId does not reference an existing user');
    }
    throw error;
  }
}

export async function getBookingRecords(query = {}, user) {
  const where = {};

  if (isAdmin(user)) {
    if (query.userId) {
      where.userId = String(query.userId);
    }
  } else {
    where.userId = user.id;
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

  return dependencies.prisma.booking.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: bookingInclude,
  });
}

export async function getBookingByIdRecord(id, user) {
  const booking = await dependencies.prisma.booking.findUnique({
    where: { id },
    include: bookingInclude,
  });

  requireBookingAccess(booking, user);

  return booking;
}

export async function cancelBookingRecord(id, user) {
  const booking = await dependencies.prisma.booking.findUnique({ where: { id } });
  requireBookingAccess(booking, user);

  try {
    return await dependencies.prisma.booking.update({
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
