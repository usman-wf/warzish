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

import { protect } from '../middlewares/authentication.js';

// Public food endpoints - no authentication required
router.get('/food', getAllFoods);
router.get('/food/:id', getFoodById);

// Protected food endpoints - require authentication
router.post('/foods', protect, bulkCreateFoods);
router.post('/food', protect, createFood);
router.put('/food/:id', protect, updateFood);
router.delete('/food/:id', protect, deleteFood);

// routes/mealEntryRoutes.js

import {
  getMealEntries,
  getDailyNutritionSummary,
  addMealEntry,
  updateMealEntry,
  deleteMealEntry
} from '../controllers/food/meal.js';

router.get('/meal', protect, getMealEntries);
router.get('/meal-summary', protect, getDailyNutritionSummary);
router.post('/meal', protect, addMealEntry);
router.put('/meal/:id', protect, updateMealEntry);
router.delete('/meal/:id', protect, deleteMealEntry);

import {
  getUserDailyTargets,
  createOrUpdateDailyTargets,
  calculateRecommendedTargets
} from '../controllers/food/daily.js';

router.get('/daily', protect, getUserDailyTargets);
router.post('/daily', protect, createOrUpdateDailyTargets);
router.get('/daily-calculate', protect, calculateRecommendedTargets);

import {
  getAllMealPlans,
  getMealPlanById,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
  getMealPlanNutrition
} from '../controllers/food/plan.js';

router.get('/plan', protect, getAllMealPlans);
router.get('/plan/:id', protect, getMealPlanById);
router.get('/plan/:id/nutrition', protect, getMealPlanNutrition);
router.post('/plan', protect, createMealPlan);
router.put('/plan/:id', protect, updateMealPlan);
router.delete('/plan/:id', protect, deleteMealPlan);

export default router;