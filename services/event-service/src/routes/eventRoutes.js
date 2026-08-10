import { Router } from 'express';
import {
  createEvent,
  deleteEvent,
  getEventById,
  getEvents,
  updateEvent,
} from '../controllers/eventController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', requireAuth, requireRole('ADMIN'), createEvent);
router.put('/:id', requireAuth, requireRole('ADMIN'), updateEvent);
router.delete('/:id', requireAuth, requireRole('ADMIN'), deleteEvent);

export default router;
