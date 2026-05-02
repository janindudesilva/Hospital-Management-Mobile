import { Router } from 'express';
import { getAllUsers, getProfile, updateUser, deleteUser, updateMyProfile, deleteMyProfile } from '../controllers/user.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateMyProfile);
router.delete('/profile', protect, deleteMyProfile);
router.get('/', protect, authorize('admin'), getAllUsers);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

export default router;
