import { Router } from 'express';
import {
  createEvent,
  deleteEvent,
  getEventById,
  getEvents,
  uploadImage,
  updateEvent,
} from '../controllers/eventController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { imageUpload } from '../middleware/upload.js';

const router = Router();

router.get('/', getEvents);
router.post('/upload-image', requireAuth, requireRole('ADMIN'), imageUpload.single('image'), uploadImage);
router.get('/:id', getEventById);
router.post('/', requireAuth, requireRole('ADMIN'), createEvent);
router.put('/:id', requireAuth, requireRole('ADMIN'), updateEvent);
router.delete('/:id', requireAuth, requireRole('ADMIN'), deleteEvent);

export default router;
