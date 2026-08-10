import { Router } from 'express';
import {
  cancelBooking,
  createBooking,
  getBookingById,
  getBookings,
} from '../controllers/bookingController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', requireAuth, createBooking);
router.get('/', requireAuth, getBookings);
router.get('/:id', requireAuth, getBookingById);
router.delete('/:id', requireAuth, cancelBooking);

export default router;
