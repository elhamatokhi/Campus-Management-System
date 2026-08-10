import {
  cancelBookingRecord,
  createBookingRecord,
  getBookingByIdRecord,
  getBookingRecords,
} from '../services/bookingService.js';

export async function createBooking(request, response) {
  const booking = await createBookingRecord(request.body);
  response.status(201).json({ success: true, data: booking });
}

export async function getBookings(request, response) {
  const bookings = await getBookingRecords(request.query);
  response.status(200).json({ success: true, data: bookings });
}

export async function getBookingById(request, response) {
  const booking = await getBookingByIdRecord(request.params.id);
  response.status(200).json({ success: true, data: booking });
}

export async function cancelBooking(request, response) {
  const booking = await cancelBookingRecord(request.params.id);
  response.status(200).json({ success: true, data: booking, message: 'Booking cancelled' });
}
