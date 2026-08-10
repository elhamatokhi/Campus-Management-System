const phaseMessage =
  'Booking Service route is available, but database persistence, service-to-service checks, and cancellation logic will be implemented in a later phase.';

export const plannedBookingFields = ['id', 'userId', 'eventId', 'status', 'createdAt'];

export const plannedBookingRules = [
  'Prevent duplicate bookings for the same user and event',
  'Check event capacity before confirming a booking',
  'Support booking cancellation',
  'Notify the serverless booking notification function after booking creation',
];

export function createBookingPlaceholder(payload) {
  return {
    success: false,
    message: phaseMessage,
    endpoint: 'POST /api/bookings',
    plannedFields: plannedBookingFields,
    plannedRules: plannedBookingRules,
    receivedFields: Object.keys(payload || {}),
  };
}

export function getBookingsPlaceholder(query = {}) {
  return {
    success: false,
    message: phaseMessage,
    endpoint: 'GET /api/bookings',
    plannedFields: plannedBookingFields,
    receivedQuery: query,
  };
}

export function getBookingByIdPlaceholder(id) {
  return {
    success: false,
    message: phaseMessage,
    endpoint: 'GET /api/bookings/:id',
    id,
    plannedFields: plannedBookingFields,
  };
}

export function cancelBookingPlaceholder(id) {
  return {
    success: false,
    message: phaseMessage,
    endpoint: 'DELETE /api/bookings/:id',
    id,
    plannedRules: ['Validate booking ownership or admin role', 'Mark booking as cancelled or remove it safely'],
  };
}

