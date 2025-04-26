import foodRoutes from './foodRoutes.js';
import mealEntryRoutes from './mealEntryRoutes.js';
import dailyTargetRoutes from './dailyTargetRoutes.js';
import mealPlanRoutes from './mealPlanRoutes.js';
import express from 'express';
const router = express.Router();

// Mount all routes
router.use('/food', foodRoutes);
router.use('/meal-entries', mealEntryRoutes);
router.use('/daily-targets', dailyTargetRoutes);
router.use('/meal-plans', mealPlanRoutes);

 
 
import {
  getAllFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood
} from '../controllers/foodController.js';

 
router.get('/food', getAllFoods);
router.get('/food:id', getFoodById);
router.post('/food', createFood);
router.put('/food:id', updateFood);
router.delete('/food:id', deleteFood);

 
// routes/mealEntryRoutes.js
 
import {
  getMealEntries,
  getDailyNutritionSummary,
  addMealEntry,
  updateMealEntry,
  deleteMealEntry
} from '../controllers/mealEntryController.js';

 
router.get('/meal', getMealEntries);
router.get('/meal/summary', getDailyNutritionSummary);
router.post('/meal', addMealEntry);
router.put('/meal:id',  updateMealEntry);
router.delete('/meal:id',   deleteMealEntry);

 
import {
  getUserDailyTargets,
  createOrUpdateDailyTargets,
  calculateRecommendedTargets
} from '../controllers/dailyTargetController.js';
 
router.get('/daily', getUserDailyTargets);
router.post('/daily',  createOrUpdateDailyTargets);
router.get('/daily/calculate',  calculateRecommendedTargets);

  
import {
  getAllMealPlans,
  getMealPlanById,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
  getMealPlanNutrition
} from '../controllers/mealPlanController.js';

 
router.get('/plan',  getAllMealPlans);
router.get('/plan:id',   getMealPlanById);
router.get('/plan:id/nutrition', getMealPlanNutrition);
router.post('/plan',   createMealPlan);
router.put('/plan:id',   updateMealPlan);
router.delete('/plan:id',   deleteMealPlan);

export default router;