import MealEntry from '../../models/MealEntry.js';
import Food from '../../models/food.js';
import mongoose from 'mongoose';

// Get meal entries for a specific date range
export const getMealEntries = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default to today if no date specified
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);
    
    const end = endDate ? new Date(endDate) : new Date(start);
    end.setHours(23, 59, 59, 999);
    
    // Get all entries for the user within date range
    const mealEntries = await MealEntry.find({
      user: req.user.id,
      date: { $gte: start, $lte: end }
    }).populate('food', 'name servingSize');
    
    return res.json(mealEntries);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// Get nutrition summary for a specific date
export const getDailyNutritionSummary = async (req, res) => {
  try {
    const { date } = req.query;
    
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Aggregate to get total calories and macros for the day
    const summary = await MealEntry.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(req.user.id),
          date: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      {
        $group: {
          _id: '$mealType',
          totalCalories: { $sum: '$caloriesConsumed' },
          totalProtein: { $sum: '$proteinConsumed' },
          totalCarbs: { $sum: '$carbsConsumed' },
          totalFat: { $sum: '$fatConsumed' },
          entries: { $push: '$$ROOT' }
        }
      }
    ]);
    
    // Calculate day totals using reduce
    const dayTotals = summary.reduce((acc, meal) => {
      return {
        calories: acc.calories + (meal.totalCalories || 0),
        protein: acc.protein + (meal.totalProtein || 0),
        carbs: acc.carbs + (meal.totalCarbs || 0),
        fat: acc.fat + (meal.totalFat || 0)
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    
    return res.json({
      date: targetDate,
      meals: summary,
      totals: dayTotals
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// Add a new meal entry
export const addMealEntry = async (req, res) => {
  try {
    const { foodId, date, mealType, quantity } = req.body;
    
    // Validate food exists
    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }
    
    // Create new meal entry
    const newMealEntry = new MealEntry({
      user: req.user.id,
      food: foodId,
      date: date || new Date(),
      mealType,
      quantity
    });
    
    // The pre-save hook will calculate the nutritional values
    const mealEntry = await newMealEntry.save();
    
    // Populate the food details for the response
    await mealEntry.populate('food', 'name servingSize');
    
    return res.json(mealEntry);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// Update a meal entry
export const updateMealEntry = async (req, res) => {
  try {
    const mealEntry = await MealEntry.findById(req.params.id);
    
    if (!mealEntry) {
      return res.status(404).json({ message: 'Meal entry not found' });
    }
    
    // Check if user owns this entry
    if (mealEntry.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Update fields
    const { foodId, date, mealType, quantity } = req.body;
    
    // Use object assignment for cleaner updates
    Object.assign(mealEntry, {
      ...(foodId && { food: foodId }),
      ...(date && { date }),
      ...(mealType && { mealType }),
      ...(quantity !== undefined && { quantity })
    });
    
    // Save will trigger pre-save hook to recalculate nutritional values
    await mealEntry.save();
    
    // Populate the food details for the response
    await mealEntry.populate('food', 'name servingSize');
    
    return res.json(mealEntry);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Meal entry not found' });
    }
    return res.status(500).json({ message: 'Server Error' });
  }
};

// Delete a meal entry
export const deleteMealEntry = async (req, res) => {
  try {
    const mealEntry = await MealEntry.findById(req.params.id);
    
    if (!mealEntry) {
      return res.status(404).json({ message: 'Meal entry not found' });
    }
    
    // Check if user owns this entry
    if (mealEntry.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    await mealEntry.deleteOne();
    return res.json({ message: 'Meal entry removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Meal entry not found' });
    }
    return res.status(500).json({ message: 'Server Error' });
  }
};
