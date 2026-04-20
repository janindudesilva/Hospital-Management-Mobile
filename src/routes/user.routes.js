import { Router } from 'express';
import { getProfile } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/profile', protect, getProfile);
export default router;
