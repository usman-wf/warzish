import express from 'express';
import * as workoutHistoryController from '../controllers/workoutHistoryController.js';
import { authenticateToken } from '../routes/authRoutes.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create a new workout history entry
router.post('/', workoutHistoryController.createWorkoutHistory);

// Get workout history with optional filters
router.get('/', workoutHistoryController.getWorkoutHistory);

// Get workout statistics
router.get('/stats', workoutHistoryController.getWorkoutStats);

// Get weight progression for specific exercise
router.get('/progression/:exercise', workoutHistoryController.getWeightProgression);

export default router; 