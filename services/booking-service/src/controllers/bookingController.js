import {
  cancelBookingPlaceholder,
  createBookingPlaceholder,
  getBookingByIdPlaceholder,
  getBookingsPlaceholder,
} from '../services/bookingService.js';

export function createBooking(request, response) {
  const result = createBookingPlaceholder(request.body);
  response.status(501).json(result);
}

export function getBookings(request, response) {
  const result = getBookingsPlaceholder(request.query);
  response.status(501).json(result);
}

export function getBookingById(request, response) {
  const result = getBookingByIdPlaceholder(request.params.id);
  response.status(501).json(result);
}

export function cancelBooking(request, response) {
  const result = cancelBookingPlaceholder(request.params.id);
  response.status(501).json(result);
}

