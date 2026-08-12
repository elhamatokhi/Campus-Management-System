import assert from 'node:assert/strict';
import test, { afterEach } from 'node:test';
import { BookingStatus } from '@prisma/client';
import {
  configureBookingServiceDependencies,
  createBookingRecord,
  resetBookingServiceDependencies,
} from './bookingService.js';

const student = { id: 'student-1', role: 'STUDENT' };
const event = {
  id: 'event-1',
  title: 'Cybersecurity Workshop',
  capacity: 50,
  _count: { bookings: 12 },
};
const createdBooking = {
  id: 'booking-1',
  userId: 'student-1',
  eventId: 'event-1',
  status: BookingStatus.CONFIRMED,
  createdAt: new Date('2026-08-12T15:59:00.000Z'),
  user: {
    id: 'student-1',
    name: 'Alex Student',
    email: 'student@example.com',
    role: 'STUDENT',
  },
  event: {
    id: 'event-1',
    title: 'Cybersecurity Workshop',
    startDate: new Date('2026-08-20T10:00:00.000Z'),
    location: 'Main Auditorium',
    capacity: 50,
  },
};

afterEach(() => {
  resetBookingServiceDependencies();
});

function createMockPrisma({ bookingCreate = async () => createdBooking } = {}) {
  return {
    event: {
      findUnique: async () => event,
    },
    booking: {
      findFirst: async () => null,
      create: bookingCreate,
    },
  };
}

test('successful booking creation publishes a notification after persistence', async () => {
  const operations = [];
  let notifiedBooking;

  configureBookingServiceDependencies({
    prisma: createMockPrisma({
      bookingCreate: async () => {
        operations.push('create');
        return createdBooking;
      },
    }),
    publishBookingCreatedNotification: async (booking) => {
      operations.push('notify');
      notifiedBooking = booking;
    },
    logger: { warn: () => {} },
  });

  const result = await createBookingRecord({ eventId: 'event-1' }, student);

  assert.equal(result.id, 'booking-1');
  assert.deepEqual(operations, ['create', 'notify']);
  assert.equal(notifiedBooking.user.email, 'student@example.com');
  assert.equal(notifiedBooking.event.title, 'Cybersecurity Workshop');
});

test('notification failure does not fail a successfully created booking', async () => {
  const warnings = [];

  configureBookingServiceDependencies({
    prisma: createMockPrisma(),
    publishBookingCreatedNotification: async () => {
      throw new Error('queue unavailable');
    },
    logger: {
      warn: (message, details) => warnings.push({ message, details }),
    },
  });

  const result = await createBookingRecord({ eventId: 'event-1' }, student);
  await new Promise((resolve) => {
    setImmediate(resolve);
  });

  assert.equal(result.id, 'booking-1');
  assert.equal(warnings[0].message, 'Booking created, but notification enqueue failed');
  assert.equal(warnings[0].details.message, 'queue unavailable');
});

test('notification is not sent when booking persistence fails', async () => {
  let notificationCount = 0;

  configureBookingServiceDependencies({
    prisma: createMockPrisma({
      bookingCreate: async () => {
        throw new Error('database write failed');
      },
    }),
    publishBookingCreatedNotification: async () => {
      notificationCount += 1;
    },
    logger: { warn: () => {} },
  });

  await assert.rejects(
    () => createBookingRecord({ eventId: 'event-1' }, student),
    /database write failed/,
  );
  assert.equal(notificationCount, 0);
});
