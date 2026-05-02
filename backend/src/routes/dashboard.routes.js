import { Router } from 'express';
import { getStats } from '../controllers/dashboard.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);

export default router;
