import User from '../../models/userModel.js';

// Get user's daily nutrition targets
export const getUserDailyTargets = async (req, res) => {
  try {
    console.log('Getting daily nutrition targets for user:', req.user.id);
    
    // Check if user has set daily targets in their profile
    const user = await User.findById(req.user.id);
    
    if (user && user.nutritionTargets) {
      return res.json({
        success: true,
        data: [user.nutritionTargets]
      });
    }
    
    // Return empty array if no targets are set
    return res.json({
      success: true,
      data: []
    });
  } catch (err) {
    console.error('Error fetching daily targets:', err);
    console.error(err.stack);
    return res.status(500).json({
      success: false,
      message: 'Server Error - Failed to fetch daily nutrition targets',
      error: err.message
    });
  }
};

// Create or update daily nutrition targets
export const createOrUpdateDailyTargets = async (req, res) => {
  try {
    console.log('Updating daily nutrition targets:', req.body);
    const { calories, protein, carbs, fat } = req.body;
    
    // Basic validation
    if (calories !== undefined && calories < 0) {
      return res.status(400).json({
        success: false,
        message: 'Calories cannot be negative'
      });
    }
    
    // Find user and update nutrition targets
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        nutritionTargets: {
          calories: calories || 0,
          protein: protein || 0,
          carbs: carbs || 0,
          fat: fat || 0
        }
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    return res.json({
      success: true,
      message: 'Daily nutrition targets updated successfully',
      data: updatedUser.nutritionTargets
    });
  } catch (err) {
    console.error('Error updating daily targets:', err);
    console.error(err.stack);
    return res.status(500).json({
      success: false,
      message: 'Server Error - Failed to update daily nutrition targets',
      error: err.message
    });
  }
};

// Calculate recommended targets based on user profile
export const calculateRecommendedTargets = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user || !user.profile) {
      return res.status(400).json({
        success: false,
        message: 'User profile not complete. Please update your profile first.'
      });
    }
    
    const { gender, weight, height, age, activityLevel, goal } = user.profile;
    
    // Simple BMR calculation using Harris-Benedict equation
    let bmr;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
    
    // Activity multiplier
    let activityMultiplier;
    switch (activityLevel) {
      case 'sedentary':
        activityMultiplier = 1.2;
        break;
      case 'light':
        activityMultiplier = 1.375;
        break;
      case 'moderate':
        activityMultiplier = 1.55;
        break;
      case 'active':
        activityMultiplier = 1.725;
        break;
      case 'very_active':
        activityMultiplier = 1.9;
        break;
      default:
        activityMultiplier = 1.2;
    }
    
    // Calculate TDEE (Total Daily Energy Expenditure)
    let tdee = bmr * activityMultiplier;
    
    // Adjust based on goal
    let goalAdjustment;
    switch (goal) {
      case 'lose':
        goalAdjustment = -500; // Caloric deficit for weight loss
        break;
      case 'gain':
        goalAdjustment = 500; // Caloric surplus for weight gain
        break;
      default:
        goalAdjustment = 0; // Maintenance
    }
    
    const recommendedCalories = Math.round(tdee + goalAdjustment);
    
    // Calculate macronutrients (example distribution)
    // Protein: 30%, Carbs: 40%, Fat: 30%
    const recommendedProtein = Math.round((recommendedCalories * 0.3) / 4); // 4 calories per gram of protein
    const recommendedCarbs = Math.round((recommendedCalories * 0.4) / 4); // 4 calories per gram of carbs
    const recommendedFat = Math.round((recommendedCalories * 0.3) / 9); // 9 calories per gram of fat
    
    return res.json({
      success: true,
      data: {
        calories: recommendedCalories,
        protein: recommendedProtein,
        carbs: recommendedCarbs,
        fat: recommendedFat
      }
    });
  } catch (err) {
    console.error('Error calculating recommended targets:', err);
    console.error(err.stack);
    return res.status(500).json({
      success: false,
      message: 'Server Error - Failed to calculate recommended targets',
      error: err.message
    });
  }
};