import assert from 'node:assert/strict';
import test from 'node:test';
import { env } from '../config/env.js';
import {
  createBookingNotificationPayload,
  publishBookingCreatedNotification,
} from './bookingNotificationQueue.js';

const booking = {
  id: 'booking-1',
  userId: 'user-1',
  eventId: 'event-1',
  status: 'CONFIRMED',
  createdAt: new Date('2026-08-12T15:59:00.000Z'),
  user: {
    id: 'user-1',
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

test('booking notification payload contains the Function contract fields', () => {
  assert.deepEqual(createBookingNotificationPayload(booking), {
    bookingId: 'booking-1',
    eventId: 'event-1',
    eventTitle: 'Cybersecurity Workshop',
    userEmail: 'student@example.com',
    userName: 'Alex Student',
    status: 'CONFIRMED',
    createdAt: '2026-08-12T15:59:00.000Z',
  });
});

test('missing queue configuration skips notification publishing safely', async () => {
  const originalConnectionString = env.bookingNotificationStorageConnectionString;
  const originalQueue = env.bookingNotificationQueue;
  const messages = [];

  env.bookingNotificationStorageConnectionString = '';
  env.bookingNotificationQueue = 'booking-notifications';

  const result = await publishBookingCreatedNotification(booking, {
    info: (message) => messages.push(message),
  });

  env.bookingNotificationStorageConnectionString = originalConnectionString;
  env.bookingNotificationQueue = originalQueue;

  assert.deepEqual(result, { skipped: true });
  assert.equal(messages[0], 'Booking notification queue is not configured; skipping notification publish.');
});
