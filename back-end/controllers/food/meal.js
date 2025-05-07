import MealEntry from '../../models/mealEntry.js';
import Food from '../../models/food.js';
//import mongoose from 'mongoose';

// Get meal entries for a specific date range
export const getMealEntries = async (req, res) => {
  try {
    console.log('Getting meal entries with query:', req.query);
    let { date, startDate, endDate } = req.query;
    
    // If a single date is provided, use it for both start and end
    if (date) {
      startDate = date;
      endDate = date;
    }
    
    // Default to today if no date specified
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);
    
    const end = endDate ? new Date(endDate) : new Date(start);
    end.setHours(23, 59, 59, 999);
    
    console.log(`Fetching meals for user ${req.user.id} between ${start.toISOString()} and ${end.toISOString()}`);
    
    // Get all entries for the user within date range
    const mealEntries = await MealEntry.find({
      user: req.user.id,
      date: { $gte: start, $lte: end }
    }).populate('food', 'name servingSize calories protein carbs fat');
    
    console.log(`Found ${mealEntries.length} meal entries for user`);
    
    // Return consistent response format
    return res.json({
      success: true,
      data: mealEntries,
      count: mealEntries.length
    });
  } catch (err) {
    console.error('Error fetching meal entries:', err);
    console.error(err.stack);
    return res.status(500).json({ 
      success: false,
      message: 'Server Error - Failed to fetch meal entries',
      error: err.message 
    });
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
          user:  req.user.id,
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
    console.log('Add meal entry request:', req.body);
    const { foodId, date, mealType, quantity } = req.body;
    
    // Input validation
    if (!foodId) {
      return res.status(400).json({ 
        success: false,
        message: 'Food ID is required' 
      });
    }
    
    if (!mealType) {
      return res.status(400).json({ 
        success: false,
        message: 'Meal type is required' 
      });
    }
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Valid quantity is required' 
      });
    }
    
    // Validate food exists
    const food = await Food.findById(foodId);
    if (!food) {
      console.error(`Food with ID ${foodId} not found`);
      return res.status(404).json({ 
        success: false,
        message: 'Food not found' 
      });
    }
    
    // Normalize meal type (lowercase)
    const normalizedMealType = mealType.toLowerCase();
    
    // Create new meal entry
    const newMealEntry = new MealEntry({
      user: req.user.id,
      food: foodId,
      date: date ? new Date(date) : new Date(),
      mealType: normalizedMealType,
      quantity: Number(quantity)
    });
    
    console.log('Creating new meal entry:', newMealEntry);
    
    // The pre-save hook will calculate the nutritional values
    const mealEntry = await newMealEntry.save();
    
    // Populate the food details for the response
    await mealEntry.populate('food', 'name servingSize calories protein carbs fat');
    
    return res.status(201).json({
      success: true,
      message: 'Meal entry created successfully',
      data: mealEntry
    });
  } catch (err) {
    console.error('Error adding meal entry:', err);
    console.error(err.stack);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        message: 'Validation Error', 
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
    
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid ID format'
      });
    }
    
    return res.status(500).json({ 
      success: false,
      message: 'Server Error - Failed to add meal entry',
      error: err.message 
    });
  }
};

// Update a meal entry
export const updateMealEntry = async (req, res) => {
  try {
    console.log('Update meal entry request:', { id: req.params.id, update: req.body });
    
    const mealEntry = await MealEntry.findById(req.params.id);
    
    if (!mealEntry) {
      return res.status(404).json({ 
        success: false,
        message: 'Meal entry not found' 
      });
    }
    
    // Check if user owns this entry
    if (mealEntry.user.toString() !== req.user.id) {
      return res.status(401).json({ 
        success: false,
        message: 'User not authorized to update this meal entry' 
      });
    }
    
    // Update fields
    const { foodId, date, mealType, quantity } = req.body;
    
    // Normalize mealType if provided
    const normalizedMealType = mealType ? mealType.toLowerCase() : undefined;
    
    // Use object assignment for cleaner updates
    Object.assign(mealEntry, {
      ...(foodId && { food: foodId }),
      ...(date && { date: new Date(date) }),
      ...(normalizedMealType && { mealType: normalizedMealType }),
      ...(quantity !== undefined && { quantity: Number(quantity) })
    });
    
    console.log('Updating meal entry:', mealEntry);
    
    // Save will trigger pre-save hook to recalculate nutritional values
    await mealEntry.save();
    
    // Populate the food details for the response
    await mealEntry.populate('food', 'name servingSize calories protein carbs fat');
    
    return res.json({
      success: true,
      message: 'Meal entry updated successfully',
      data: mealEntry
    });
  } catch (err) {
    console.error('Error updating meal entry:', err);
    console.error(err.stack);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        message: 'Validation Error', 
        errors: Object.values(err.errors).map(e => e.message)
      });
    }
    
    if (err.name === 'CastError' || err.kind === 'ObjectId') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid ID format',
        error: err.message
      });
    }
    
    return res.status(500).json({ 
      success: false,
      message: 'Server Error - Failed to update meal entry',
      error: err.message 
    });
  }
};

// Delete a meal entry
export const deleteMealEntry = async (req, res) => {
  try {
    console.log('Delete meal entry request:', { id: req.params.id });
    
    const mealEntry = await MealEntry.findById(req.params.id);
    
    if (!mealEntry) {
      return res.status(404).json({ 
        success: false,
        message: 'Meal entry not found' 
      });
    }
    
    // Check if user owns this entry
    if (mealEntry.user.toString() !== req.user.id) {
      return res.status(401).json({ 
        success: false,
        message: 'User not authorized to delete this meal entry' 
      });
    }
    
    // Use the static deleteOne method instead of instance method
    await MealEntry.deleteOne({ _id: req.params.id });
    
    return res.json({ 
      success: true,
      message: 'Meal entry deleted successfully',
      data: { id: req.params.id }
    });
  } catch (err) {
    console.error('Error deleting meal entry:', err);
    console.error(err.stack);
    
    if (err.name === 'CastError' || err.kind === 'ObjectId') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid ID format',
        error: err.message
      });
    }
    
    return res.status(500).json({ 
      success: false,
      message: 'Server Error - Failed to delete meal entry',
      error: err.message 
    });
  }
};
