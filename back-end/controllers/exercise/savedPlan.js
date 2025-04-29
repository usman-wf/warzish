import SavedPlan from '../../models/savedPlans.js';
import WorkoutPlan from '../../models/workoutPlan.js';

// Save a workout plan
export const saveWorkoutPlan = async (req, res) => {
  try {
    const { workoutPlanId, folder } = req.body;
    
    // Check if workout plan exists
    const workoutPlan = await WorkoutPlan.findById(workoutPlanId);
   
    if (!workoutPlan) {
      return res.status(404).json({
        success: false,
        message: 'Workout plan not found'
      });
    }
  
    
    // Check if already saved
    const existingSaved = await SavedPlan.findOne({
      userId: req.user.id,
      workoutPlanId
    });
    
    if (existingSaved) {
      return res.status(400).json({
        success: false,
        message: 'You have already saved this workout plan'
      });
    }
  
    // Create new saved plan
    const newSavedPlan = new SavedPlan({
      userId: req.user.id,
      workoutPlanId,
      folder: folder || 'Default'
    });
    
    const savedPlan = await newSavedPlan.save();
    
    res.status(201).json({
      success: true,
      data: savedPlan
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all saved workout plans
export const getSavedWorkoutPlans = async (req, res) => {
  try {
    const { folder, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = { userId: '680bdbbf58c1fa94b816eba5' };
    
    if (folder) filter.folder = folder;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get saved plans with full workout plan data
    const savedPlans = await SavedPlan.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ savedAt: -1 })
      .populate({
        path: 'workoutPlanId',
        populate: {
          path: 'exercises.exerciseId',
          model: 'Exercise'
        }
      });
    
    const total = await SavedPlan.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: savedPlans.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: savedPlans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Remove saved workout plan
export const removeSavedWorkoutPlan = async (req, res) => {
  try {
    const savedPlan = await SavedPlan.findById(req.params.id);
    
    if (!savedPlan) {
      return res.status(404).json({
        success: false,
        message: 'Saved workout plan not found'
      });
    }
    
    // Check if user is the owner
    if (savedPlan.userId.toString() !== '680bdbbf58c1fa94b816eba5') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only remove your own saved plans'
      });
    }
    
    await SavedPlan.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Workout plan removed from saved list successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update saved workout plan organization
export const updateSavedWorkoutPlan = async (req, res) => {
  try {
    const { folder } = req.body;
    
    const savedPlan = await SavedPlan.findById(req.params.id);
    
    if (!savedPlan) {
      return res.status(404).json({
        success: false,
        message: 'Saved workout plan not found'
      });
    }
    
    // Check if user is the owner
    if (savedPlan.userId.toString() !== '680bdbbf58c1fa94b816eba5') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own saved plans'
      });
    }
    
    const updatedSavedPlan = await SavedPlan.findByIdAndUpdate(
      req.params.id,
      { folder },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedSavedPlan
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};