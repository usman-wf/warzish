import express from 'express';
import { authenticateToken } from './authRoutes.js';
import * as sharedWorkoutController from '../controllers/sharedWorkoutController.js';
import * as collaborativeGoalController from '../controllers/collaborativeGoalController.js';

const router = express.Router();

// Shared Workout Routes
router.post('/workouts/share', authenticateToken, sharedWorkoutController.shareWorkout);
router.get('/workouts/feed', authenticateToken, sharedWorkoutController.getActivityFeed);
router.post('/workouts/:sharedWorkoutId/like', authenticateToken, sharedWorkoutController.toggleLike);
router.post('/workouts/:sharedWorkoutId/comment', authenticateToken, sharedWorkoutController.addComment);

// Collaborative Goals Routes
router.post('/goals', authenticateToken, collaborativeGoalController.createGoal);
router.get('/goals', authenticateToken, collaborativeGoalController.getUserGoals);
router.put('/goals/:goalId/progress', authenticateToken, collaborativeGoalController.updateProgress);
router.put('/goals/:goalId/status', authenticateToken, collaborativeGoalController.updateParticipantStatus);

export default router; 