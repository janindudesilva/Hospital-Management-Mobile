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
    body('department').notEmpty().withMessage('Department is required')
  ],
  validateRequest,
  createDoctor
);

router.put('/:id', protect, authorize('admin'), updateDoctor);
router.delete('/:id', protect, authorize('admin'), deleteDoctor);

export default router;
