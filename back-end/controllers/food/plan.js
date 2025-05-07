import MealPlan from '../../models/mealPlan.js';
import Food from '../../models/food.js';

// Get all meal plans for a user
export const getAllMealPlans = async (req, res) => {
  try {
    const mealPlans = await MealPlan.find({ user: req.user.id })
      .sort({ updatedAt: -1 });
    
    return res.json(mealPlans);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// Get a single meal plan by ID
export const getMealPlanById = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id)
      .populate('meals.food', 'name calories protein carbs fat servingSize');
    
    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }
    
    // Check if user owns this meal plan
    if (mealPlan.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
        return res.json(mealPlan);
      }
  catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Meal plan not found' });
    }
    return res.status(500).json({ message: 'Server Error' });
  }
};

// Get nutrition summary for a meal plan
export const getMealPlanNutrition = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id)
      .populate('meals.food', 'name calories protein carbs fat servingSize');
    
    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }
    
    // Check if user owns this meal plan
    if (mealPlan.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }
    
    // Calculate nutrition by meal type
    const mealTypeNutrition = mealPlan.meals.reduce((acc, meal) => {
      const mealType = meal.mealType;
      const quantity = meal.quantity;
      const food = meal.food;
      
      if (!acc[mealType]) {
        acc[mealType] = {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          items: []
        };
      }
      
      // Add nutritional values
      acc[mealType].calories += food.calories * quantity;
      acc[mealType].protein += food.protein * quantity;
      acc[mealType].carbs += food.carbs * quantity;
      acc[mealType].fat += food.fat * quantity;
      
      // Add food item info
      acc[mealType].items.push({
        foodId: food._id,
        name: food.name,
        quantity,
        calories: food.calories * quantity,
        protein: food.protein * quantity,
        carbs: food.carbs * quantity,
        fat: food.fat * quantity
      });
      
      return acc;
    }, {});
    
    // Calculate total nutrition
    const totalNutrition = Object.values(mealTypeNutrition).reduce((total, mealType) => {
      return {
        calories: total.calories + mealType.calories,
        protein: total.protein + mealType.protein,
        carbs: total.carbs + mealType.carbs,
        fat: total.fat + mealType.fat
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    
    return res.json({
      mealPlanId: mealPlan._id,
      name: mealPlan.name,
      byMealType: mealTypeNutrition,
      totals: totalNutrition
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Meal plan not found' });
    }
    return res.status(500).json({ message: 'Server Error' });
  }
};

// Create a new meal plan
export const createMealPlan = async (req, res) => {
  try {
    const {
      name,
      description,
      targetCalories,
      weekdays,
      meals
    } = req.body;
    
    // Validate that all food IDs exist
    if (meals && meals.length > 0) {
      const foodIds = [...new Set(meals.map(meal => meal.food))];
      const foundFoods = await Food.find({ _id: { $in: foodIds } }).countDocuments();
      
      if (foundFoods !== foodIds.length) {
        return res.status(400).json({ message: 'One or more food items not found' });
      }
    }
    
    const newMealPlan = new MealPlan({
      user: req.user.id,
      name,
      description,
      targetCalories,
      weekdays: weekdays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      meals: meals || []
    });
    
    const mealPlan = await newMealPlan.save();
    return res.json(mealPlan);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// Update an existing meal plan
export const updateMealPlan = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id);
    
    if (!mealPlan) {
      return res.status(404).json({ 
        success: false,
        message: 'Meal plan not found' 
      });
    }
    
    // Check if user owns this meal plan
    if (mealPlan.user.toString() !== req.user.id) {
      return res.status(401).json({ 
        success: false,
        message: 'User not authorized' 
      });
    }
    
    const {
      name,
      description,
      targetCalories,
      weekdays,
      meals,
      isActive
    } = req.body;
    
    // Validate that all food IDs exist if meals are being updated
    if (meals && meals.length > 0) {
      const foodIds = [...new Set(meals.map(meal => meal.food))];
      const foundFoods = await Food.find({ _id: { $in: foodIds } }).countDocuments();
      
      if (foundFoods !== foodIds.length) {
        return res.status(400).json({ 
          success: false,
          message: 'One or more food items not found' 
        });
      }
    }
    
    // Update fields
    if (name) mealPlan.name = name;
    if (description !== undefined) mealPlan.description = description;
    if (targetCalories !== undefined) mealPlan.targetCalories = targetCalories;
    if (weekdays) mealPlan.weekdays = weekdays;
    if (meals) mealPlan.meals = meals;
    if (isActive !== undefined) mealPlan.isActive = isActive;
    
    const updatedMealPlan = await mealPlan.save();
    
    // Populate food details for response
    await updatedMealPlan.populate('meals.food', 'name calories protein carbs fat servingSize');
    
    return res.json({
      success: true,
      data: updatedMealPlan
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false,
        message: 'Meal plan not found' 
      });
    }
    return res.status(500).json({ 
      message: 'Server Error',
      error: err.message
    });
  }
};

// Delete a meal plan - completely rewritten for reliability
export const deleteMealPlan = async (req, res) => {
  try {
    const planId = req.params.id;
    const userId = req.user.id;
    
    console.log(`DELETE OPERATION: Attempting to delete meal plan with ID: ${planId} for user: ${userId}`);
    
    if (!planId) {
      console.log('DELETE ERROR: Missing plan ID');
      return res.status(400).json({ 
        success: false,
        message: 'Missing meal plan ID' 
      });
    }
    
    // Try different deletion approaches, from most direct to most complex
    try {
      // APPROACH 1: Direct findByIdAndDelete
      console.log('DELETE APPROACH 1: Using findByIdAndDelete');
      const deleteResult = await MealPlan.findOneAndDelete({ 
        _id: planId,
        user: userId 
      });
      
      if (deleteResult) {
        console.log('DELETE SUCCESS with approach 1:', deleteResult);
        return res.status(200).json({
          success: true,
          message: 'Meal plan deleted successfully',
          planId: planId
        });
      }
      
      console.log('DELETE APPROACH 1 failed, no document found');
      
      // APPROACH 2: Verify plan exists first, then delete
      console.log('DELETE APPROACH 2: Checking existence first');
      const planExists = await MealPlan.findOne({ 
        _id: planId,
        user: userId
      });
      
      if (!planExists) {
        console.log('DELETE ERROR: Plan not found or not authorized');
        return res.status(404).json({
          success: false,
          message: 'Meal plan not found or you are not authorized to delete it'
        });
      }
      
      // Plan exists and is owned by this user, so remove it
      console.log('DELETE APPROACH 2: Plan found, attempting deleteOne');
      const deleteOneResult = await MealPlan.deleteOne({ _id: planId });
      
      if (deleteOneResult.deletedCount > 0) {
        console.log('DELETE SUCCESS with approach 2:', deleteOneResult);
        return res.status(200).json({
          success: true,
          message: 'Meal plan deleted successfully',
          planId: planId
        });
      }
      
      console.log('DELETE APPROACH 2 failed, could not delete');
      
      // APPROACH 3: If all else fails, mark as inactive
      console.log('DELETE APPROACH 3: Marking as inactive');
      planExists.isActive = false;
      const savedResult = await planExists.save();
      
      if (savedResult) {
        console.log('DELETE SUCCESS with approach 3 (marked inactive):', savedResult);
        return res.status(200).json({
          success: true,
          message: 'Meal plan marked as inactive',
          planId: planId
        });
      }
      
      // If we get here, all approaches failed
      console.log('DELETE ERROR: All approaches failed');
      return res.status(500).json({
        success: false,
        message: 'Failed to delete meal plan after multiple attempts'
      });
    } catch (innerError) {
      console.error('DELETE INNER ERROR:', innerError);
      throw innerError;
    }
  } catch (err) {
    console.error('DELETE OUTER ERROR:', err);
    console.error('Error stack:', err.stack);
    
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting meal plan',
      error: err.message
    });
  }
};

// Alias for compatibility with existing route
export const deleteOneMealPlan = deleteMealPlan;