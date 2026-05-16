import express from 'express';
import { auth } from '../../middleware/auth.middleware.js';
import { upload } from '../../config/cloudinary.js';
import {
    getMyProfile,
    updateProfile,
    uploadAvatar,
    changePassword,
    deleteAccount,
    getPublicProfile
} from './profile.controller.js';

const router = express.Router();



// Protected routes
router.use(auth);

router.get('/me', getMyProfile);
router.put('/update', updateProfile);
router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.put('/change-password', changePassword);
router.delete('/delete-account', deleteAccount);

// Public route (Keep at bottom to avoid intercepting specific routes)
router.get('/:id', getPublicProfile);

export default router;
