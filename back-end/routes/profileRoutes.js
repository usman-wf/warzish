import { Router } from 'express';
import { getUserProfile, updateUserProfile, updateProfilePicture } from '../controllers/profile/profileController.js';
import { getUserGoals, createGoal, updateGoal, deleteGoal, updateProgress } from '../controllers/profile/goalsController.js';
import { authenticateToken } from './authRoutes.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/profile-pictures';

        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Create unique filename with user ID
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, `user-${req.userId}-${uniqueSuffix}${fileExtension}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        // Accept only images
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Profile routes
router.get('/profile', authenticateToken, getUserProfile);
router.put('/profile', authenticateToken, updateUserProfile);
router.post('/profile/picture', authenticateToken, upload.single('profilePicture'), updateProfilePicture);

// Goals routes
router.get('/goals', authenticateToken, getUserGoals);
router.post('/goals', authenticateToken, createGoal);
router.put('/goals/:goalId', authenticateToken, updateGoal);
router.delete('/goals/:goalId', authenticateToken, deleteGoal);
router.post('/goals/:goalId/progress', authenticateToken, updateProgress);

export default router; 