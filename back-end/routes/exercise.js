import express from 'express';
import {
  createExercise,
  getAllExercises,
  getExerciseById,
  updateExercise,
  deleteExercise
} from '../controllers/exercise/exercise.js';

const router = express.Router();
router
  .route('/exercises')
  .post(createExercise)
  .get(getAllExercises);

router
  .route('/exercises/:id')
  .get(getExerciseById)
  .put(updateExercise)
  .delete(deleteExercise);

// File: routes/workoutPlanRoutes.js
import {
  createWorkoutPlan,
  getUserWorkoutPlans,
  getWorkoutPlanById,
  updateWorkoutPlan,
  deleteWorkoutPlan,
  getPublicWorkoutPlans,
  getPublicWorkoutPlanById
} from '../controllers/exercise/workoutPlan.js';
import { protect } from '../middlewares/authentication.js';

// Test the auth middleware
router.use((req, res, next) => {
  console.log('Exercise routes middleware triggered');
  next();
});

// Personal workouts endpoint is now handled directly at the app level
// This is intentionally removed to avoid conflicts

// Generic workout routes
router
  .route('/workout')
  .post(protect, createWorkoutPlan)
  .get(protect, getUserWorkoutPlans);

router
  .route('/workout/:id')
  .get(protect, getWorkoutPlanById)
  .put(protect, updateWorkoutPlan)
  .delete(protect, deleteWorkoutPlan);

// Public workout routes
router
  .route('/workout-public')
  .get(getPublicWorkoutPlans);

router
  .route('/workout-public/:id')
  .get(getPublicWorkoutPlanById);

// File: routes/savedPlanRoutes.js
import {
  saveWorkoutPlan,
  getSavedWorkoutPlans,
  removeSavedWorkoutPlan,
  updateSavedWorkoutPlan
} from '../controllers/exercise/savedPlan.js';

router
  .route('/workout-saved')
  .post(protect, saveWorkoutPlan)
  .get(protect, getSavedWorkoutPlans);

router
  .route('/workout-saved/:id')
  .delete(protect, removeSavedWorkoutPlan)
  .put(protect, updateSavedWorkoutPlan);

export default router;