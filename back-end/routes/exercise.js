import express from 'express';
import {
  createExercise,
  getAllExercises,
  getExerciseById,
  updateExercise,
  deleteExercise
} from '../controllers/exerciseController.js';
 
const router = express.Router();
router
  .route('/exercises')
  .post(createExercise)
  .get(getAllExercises);

router
  .route('/exercises:id')
  .get(getExerciseById)
  .put(updateExercise)
  .delete( deleteExercise);

 

// File: routes/workoutPlanRoutes.js

 
import {
  createWorkoutPlan,
  getUserWorkoutPlans,
  getWorkoutPlanById,
  updateWorkoutPlan,
  deleteWorkoutPlan
} from '../controllers/workoutPlanController.js';
 

router
  .route('/workout')
  .post(createWorkoutPlan)
  .get(getUserWorkoutPlans);

router
  .route('/workout:id')
  .get( getWorkoutPlanById)
  .put( updateWorkoutPlan)
  .delete( deleteWorkoutPlan);

 
// File: routes/savedPlanRoutes.js

import {
  saveWorkoutPlan,
  getSavedWorkoutPlans,
  removeSavedWorkoutPlan,
  updateSavedWorkoutPlan
} from '../controllers/savedPlanController.js';



router
  .route('/workout/saved')
  .post(saveWorkoutPlan)
  .get(getSavedWorkoutPlans);

router
  .route('/workout/saved:id')
  .delete(removeSavedWorkoutPlan)
  .put(updateSavedWorkoutPlan);

export default router;