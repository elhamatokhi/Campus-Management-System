const requiredFields = [
  'bookingId',
  'eventId',
  'eventTitle',
  'userEmail',
  'status',
  'createdAt',
];

function parseQueueMessage(message) {
  if (message instanceof Uint8Array) {
    return parseQueueMessage(Buffer.from(message).toString('utf8'));
  }

  if (typeof message === 'string') {
    try {
      return JSON.parse(message);
    } catch {
      throw new Error('Queue message must be valid JSON');
    }
  }

  if (message && typeof message === 'object' && !Array.isArray(message)) {
    return message;
  }

  throw new Error('Queue message must be a JSON object');
}

export function validateBookingNotificationMessage(message) {
  const payload = parseQueueMessage(message);
  const missingFields = requiredFields.filter((field) => !String(payload[field] || '').trim());

  if (missingFields.length > 0) {
    throw new Error(`Booking notification message is missing required fields: ${missingFields.join(', ')}`);
  }

  const createdAt = new Date(payload.createdAt);
  if (Number.isNaN(createdAt.getTime())) {
    throw new Error('Booking notification message createdAt must be a valid ISO date');
  }

  return {
    bookingId: String(payload.bookingId).trim(),
    eventId: String(payload.eventId).trim(),
    eventTitle: String(payload.eventTitle).trim(),
    userEmail: String(payload.userEmail).trim(),
    userName: payload.userName ? String(payload.userName).trim() : '',
    status: String(payload.status).trim().toUpperCase(),
    createdAt: createdAt.toISOString(),
  };
}

export function createBookingNotificationSummary(message) {
  const payload = validateBookingNotificationMessage(message);

  return {
    bookingId: payload.bookingId,
    eventId: payload.eventId,
    eventTitle: payload.eventTitle,
    status: payload.status,
    createdAt: payload.createdAt,
  };
}

export async function processBookingNotification(message, context) {
  const summary = createBookingNotificationSummary(message);

  context.log('Processing booking notification', {
    bookingId: summary.bookingId,
    eventId: summary.eventId,
    eventTitle: summary.eventTitle,
    status: summary.status,
  });

  context.log('Notification processed successfully', {
    bookingId: summary.bookingId,
    createdAt: summary.createdAt,
  });

  return summary;
}
