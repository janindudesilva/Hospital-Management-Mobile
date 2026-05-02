import { Router } from 'express';
import { body } from 'express-validator';
import { createDoctor, deleteDoctor, getDoctors, updateDoctor } from '../controllers/doctor.controller.js';
import { authorize, protect } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';

const router = Router();

router.get('/', getDoctors);
router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('fullName').notEmpty().withMessage('Doctor name is required'),
    body('specialization').notEmpty().withMessage('Specialization is required'),
    body('department').notEmpty().withMessage('Department is required'),
    body('qualification').notEmpty().withMessage('Qualification is required'),
    body('experience').notEmpty().withMessage('Experience is required'),
    body('consultationFee').isNumeric().withMessage('Consultation fee must be a number')
  ],
  validateRequest,
  createDoctor
);

router.put(
  '/:id', 
  protect, 
  authorize('admin'), 
  [
    body('fullName').optional().notEmpty().withMessage('Doctor name cannot be empty'),
    body('specialization').optional().notEmpty().withMessage('Specialization is required'),
    body('department').optional().notEmpty().withMessage('Department is required'),
    body('experience').optional().notEmpty().withMessage('Experience is required'),
    body('consultationFee').optional().isNumeric().withMessage('Fee must be a number')
  ],
  validateRequest,
  updateDoctor
);
router.delete('/:id', protect, authorize('admin'), deleteDoctor);

export default router;
