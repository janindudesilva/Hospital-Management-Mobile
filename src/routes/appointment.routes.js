import { Router } from 'express';
import { body } from 'express-validator';
import { createAppointment, getMyAppointments } from '../controllers/appointment.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';

const router = Router();

router.get('/my', protect, getMyAppointments);
router.post(
  '/',
  protect,
  [
    body('doctor').notEmpty().withMessage('Doctor id is required'),
    body('appointmentDate').notEmpty().withMessage('Appointment date is required'),
    body('startTime').notEmpty().withMessage('Start time is required'),
    body('endTime').notEmpty().withMessage('End time is required')
  ],
  validateRequest,
  createAppointment
);

export default router;
