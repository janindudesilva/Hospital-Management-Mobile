import { Router } from 'express';
import { createPrediction } from '../controllers/prediction.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();
router.post('/', protect, createPrediction);
export default router;
