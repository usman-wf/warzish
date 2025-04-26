import DailyTarget from '../../models/dailyTarget.js';
import User from '../../models/userModel.js';

// Get user's daily nutrition targets
export const getUserDailyTargets = async (req, res) => {
  try {
    const dailyTarget = await DailyTarget.findOne({ user: req.user.id });
    
    if (!dailyTarget) {
      return res.status(404).json({ message: 'Daily targets not set up yet' });
    }
    
    return res.json(dailyTarget);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// Create or update daily nutrition targets
export const createOrUpdateDailyTargets = async (req, res) => {
  try {
    const {
      bmr,
      calorieTarget,
      proteinTarget,
      carbTarget,
      fatTarget,
      fiberTarget,
      sugarTarget,
      sodiumTarget,
      waterTarget,
      activityMultiplier
    } = req.body;
    
    // Find existing target for user or create new one
    let dailyTarget = await DailyTarget.findOne({ user: req.user.id });
    
    if (dailyTarget) {
      // Update using modern ES6 approach
      Object.assign(dailyTarget, {
        ...(bmr !== undefined && { bmr }),
        ...(calorieTarget !== undefined && { calorieTarget }),
        ...(proteinTarget !== undefined && { proteinTarget }),
        ...(carbTarget !== undefined && { carbTarget }),
        ...(fatTarget !== undefined && { fatTarget }),
        ...(fiberTarget !== undefined && { fiberTarget }),
        ...(sugarTarget !== undefined && { sugarTarget }),
        ...(sodiumTarget !== undefined && { sodiumTarget }),
        ...(waterTarget !== undefined && { waterTarget }),
        ...(activityMultiplier !== undefined && { activityMultiplier }),
        updatedAt: Date.now()
      });
    } else {
      // Create new daily target
      dailyTarget = new DailyTarget({
        user: req.user.id,
        bmr,
        calorieTarget,
        proteinTarget,
        carbTarget,
        fatTarget,
        fiberTarget,
        sugarTarget,
        sodiumTarget,
        waterTarget,
        activityMultiplier
      });
    }
    
    await dailyTarget.save();
    return res.json(dailyTarget);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// Calculate recommended daily targets based on user profile
export const calculateRecommendedTargets = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.height?.value || !user.weight?.value || !user.dateOfBirth || !user.gender) {
      return res.status(400).json({ 
        message: 'Cannot calculate targets: Missing profile data (height, weight, age, or gender)'
      });
    }
    
    // Calculate age using ES6 features
    const today = new Date();
    const birthDate = new Date(user.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    // Convert height/weight to metric if needed
    const heightCm = user.height.unit === 'in' 
      ? user.height.value * 2.54 
      : user.height.value;
    
    const weightKg = user.weight.unit === 'lb' 
      ? user.weight.value * 0.453592 
      : user.weight.value;
    
    // Calculate BMR using Mifflin-St Jeor equation with template literals
    const bmr = user.gender === 'male'
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    
    // Default activity multiplier
    const activityMultiplier = 1.2; // Sedentary
    
    // Calculate TDEE (Total Daily Energy Expenditure)
    const tdee = bmr * activityMultiplier;
    
    // Set calorie target based on goal using improved control flow
    let calorieTarget;
    switch(user.nutritionGoal) {
      case 'lose_weight':
        calorieTarget = tdee - 500; // 500 calorie deficit
        break;
      case 'gain_weight':
        calorieTarget = tdee + 500; // 500 calorie surplus
        break;
      default:
        calorieTarget = tdee; // maintain weight
    }
    
    // Calculate macronutrient distribution
    // Initial values - Protein: 30%, Carbs: 40%, Fat: 30%
    let macroDistribution = {
      proteinPct: 0.3,
      carbsPct: 0.4,
      fatPct: 0.3
    };
    
    // Adjust macros based on diet goal
    switch(user.nutritionGoal) {
      case 'lose_weight':
        macroDistribution = { proteinPct: 0.35, carbsPct: 0.35, fatPct: 0.3 };
        break;
      case 'gain_weight':
        macroDistribution = { proteinPct: 0.25, carbsPct: 0.45, fatPct: 0.3 };
        break;
    }
    
    // Destructure for easier access
    const { proteinPct, carbsPct, fatPct } = macroDistribution;
    
    // Calculate grams of each macro
    // Protein & carbs = 4 cal/g, fat = 9 cal/g
    const proteinTarget = Math.round((calorieTarget * proteinPct) / 4);
    const carbTarget = Math.round((calorieTarget * carbsPct) / 4);
    const fatTarget = Math.round((calorieTarget * fatPct) / 9);
    
    // Calculate other targets
    const fiberTarget = Math.round(carbTarget * 0.15); // ~15% of carbs
    const sugarTarget = Math.round(carbTarget * 0.1); // ~10% of carbs
    const sodiumTarget = 2300; // mg, general recommendation
    const waterTarget = Math.round(weightKg * 0.033); // L, ~33ml per kg body weight
    
    // Return calculated values as an object
    return res.json({
      calculatedTargets: {
        bmr: Math.round(bmr),
        activityMultiplier,
        calorieTarget: Math.round(calorieTarget),
        proteinTarget,
        carbTarget,
        fatTarget,
        fiberTarget,
        sugarTarget,
        sodiumTarget,
        waterTarget
      }
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: 'Server Error' });
  }
};