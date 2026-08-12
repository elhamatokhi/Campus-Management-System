import { QueueClient } from '@azure/storage-queue';
import { env } from '../config/env.js';

export function createBookingNotificationPayload(booking) {
  return {
    bookingId: booking.id,
    eventId: booking.eventId,
    eventTitle: booking.event?.title || '',
    userEmail: booking.user?.email || '',
    userName: booking.user?.name || '',
    status: booking.status,
    createdAt: booking.createdAt instanceof Date ? booking.createdAt.toISOString() : booking.createdAt,
  };
}

export async function publishBookingCreatedNotification(booking, logger = console) {
  if (!env.bookingNotificationStorageConnectionString || !env.bookingNotificationQueue) {
    logger.info?.('Booking notification queue is not configured; skipping notification publish.');
    return { skipped: true };
  }

  const payload = createBookingNotificationPayload(booking);
  const queueClient = QueueClient.fromConnectionString(
    env.bookingNotificationStorageConnectionString,
    env.bookingNotificationQueue,
  );

  await queueClient.sendMessage(JSON.stringify(payload));
  logger.info?.('Booking notification queued', {
    bookingId: payload.bookingId,
    eventId: payload.eventId,
  });

  return { skipped: false };
}
