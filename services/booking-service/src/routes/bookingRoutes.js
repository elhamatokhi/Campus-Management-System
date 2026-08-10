import { Router } from 'express';
import {
  cancelBooking,
  createBooking,
  getBookingById,
  getBookings,
} from '../controllers/bookingController.js';

const router = Router();

router.post('/', createBooking);
router.get('/', getBookings);
router.get('/:id', getBookingById);
router.delete('/:id', cancelBooking);

export default router;

