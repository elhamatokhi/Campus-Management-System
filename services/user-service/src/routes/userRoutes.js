import { Router } from 'express';
import {
  getCurrentUser,
  loginUser,
  registerUser,
  updateCurrentUser,
} from '../controllers/userController.js';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', getCurrentUser);
router.put('/me', updateCurrentUser);

export default router;

