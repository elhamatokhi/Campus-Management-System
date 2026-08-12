import { describe, expect, it, vi } from 'vitest';
import {
  createBookingNotificationSummary,
  processBookingNotification,
  validateBookingNotificationMessage,
} from '../bookingNotificationProcessor.js';

const validMessage = {
  bookingId: 'booking-123',
  eventId: 'event-456',
  eventTitle: 'Cybersecurity Workshop',
  userEmail: 'student@example.com',
  userName: 'Alex Morgan',
  status: 'CONFIRMED',
  createdAt: '2026-08-12T10:00:00.000Z',
};

function createMockContext() {
  return {
    log: vi.fn(),
    error: vi.fn(),
  };
}

describe('booking notification processor', () => {
  it('validates a complete booking notification payload', () => {
    expect(validateBookingNotificationMessage(validMessage)).toEqual(validMessage);
  });

  it('accepts a JSON string queue message', () => {
    expect(createBookingNotificationSummary(JSON.stringify(validMessage))).toEqual({
      bookingId: 'booking-123',
      eventId: 'event-456',
      eventTitle: 'Cybersecurity Workshop',
      status: 'CONFIRMED',
      createdAt: '2026-08-12T10:00:00.000Z',
    });
  });

  it('accepts a Buffer queue message representation', () => {
    expect(createBookingNotificationSummary(Buffer.from(JSON.stringify(validMessage)))).toEqual({
      bookingId: 'booking-123',
      eventId: 'event-456',
      eventTitle: 'Cybersecurity Workshop',
      status: 'CONFIRMED',
      createdAt: '2026-08-12T10:00:00.000Z',
    });
  });

  it('rejects malformed JSON queue messages', () => {
    expect(() => validateBookingNotificationMessage('{bad-json')).toThrow('valid JSON');
  });

  it('rejects messages with missing required fields', () => {
    expect(() => validateBookingNotificationMessage({ ...validMessage, bookingId: '' })).toThrow('bookingId');
  });

  it('rejects messages with invalid createdAt values', () => {
    expect(() => validateBookingNotificationMessage({ ...validMessage, createdAt: 'not-a-date' })).toThrow('valid ISO date');
  });

  it('logs a safe processing summary and completes successfully', async () => {
    const context = createMockContext();

    await expect(processBookingNotification(validMessage, context)).resolves.toEqual({
      bookingId: 'booking-123',
      eventId: 'event-456',
      eventTitle: 'Cybersecurity Workshop',
      status: 'CONFIRMED',
      createdAt: '2026-08-12T10:00:00.000Z',
    });

    expect(context.log).toHaveBeenCalledWith('Processing booking notification', {
      bookingId: 'booking-123',
      eventId: 'event-456',
      eventTitle: 'Cybersecurity Workshop',
      status: 'CONFIRMED',
    });
    expect(context.log).toHaveBeenCalledWith('Notification processed successfully', {
      bookingId: 'booking-123',
      createdAt: '2026-08-12T10:00:00.000Z',
    });
  });
});
