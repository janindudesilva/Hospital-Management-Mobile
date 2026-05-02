import { Router } from 'express';
import { createDepartment, deleteDepartment, getDepartments, updateDepartment } from '../controllers/department.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', getDepartments);

router.use(protect);
router.use(authorize('admin'));

router.post('/', createDepartment);
router.put('/:id', updateDepartment);
router.delete('/:id', deleteDepartment);

export default router;
