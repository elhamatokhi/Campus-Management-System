import { apiRequest } from './apiClient.js';

export function createBooking(token, eventId) {
  return apiRequest('booking', '/api/bookings', {
    method: 'POST',
    token,
    body: { eventId },
  });
}

export function getBookings(token) {
  return apiRequest('booking', '/api/bookings', { token });
}

export function cancelBooking(token, id) {
  return apiRequest('booking', `/api/bookings/${id}`, {
    method: 'DELETE',
    token,
  });
}

