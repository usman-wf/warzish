
import express from 'express';
const router = express.Router();

import {
  getAllFoods,
  getFoodById,
  createFood,
  bulkCreateFoods,
  updateFood,
  deleteFood
} from '../controllers/food/food.js';

 
router.get('/food', getAllFoods);
router.post('/foods', bulkCreateFoods); // Bulk create endpoint
router.get('/food/:id', getFoodById);
router.post('/food', createFood);
router.put('/food/:id', updateFood);
router.delete('/food/:id', deleteFood);

 
// routes/mealEntryRoutes.js
 
import {
  getMealEntries,
  getDailyNutritionSummary,
  addMealEntry,
  updateMealEntry,
  deleteMealEntry
} from '../controllers/food/meal.js';

 
router.get('/meal', getMealEntries);
router.get('/meal-summary', getDailyNutritionSummary);
router.post('/meal', addMealEntry);
router.put('/meal/:id',  updateMealEntry);
router.delete('/meal/:id',   deleteMealEntry);

 
import {
  getUserDailyTargets,
  createOrUpdateDailyTargets,
  calculateRecommendedTargets
} from '../controllers/food/daily.js';
 
router.get('/daily', getUserDailyTargets);
router.post('/daily',  createOrUpdateDailyTargets);
router.get('/daily-calculate',  calculateRecommendedTargets);

  
import {
  getAllMealPlans,
  getMealPlanById,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
  getMealPlanNutrition
} from '../controllers/food/plan.js';

 
router.get('/plan',  getAllMealPlans);
router.get('/plan:id',   getMealPlanById);
router.get('/plan/:id/nutrition', getMealPlanNutrition);
router.post('/plan',   createMealPlan);
router.put('/plan/:id',   updateMealPlan);
router.delete('/plan/:id',   deleteMealPlan);

export default router;