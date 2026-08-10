import { Router } from 'express';
import {
  getCurrentUser,
  loginUser,
  registerUser,
  updateCurrentUser,
} from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', requireAuth, getCurrentUser);
router.put('/me', requireAuth, updateCurrentUser);

export default router;
