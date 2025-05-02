import WorkoutPlan from '../../models/workoutPlan.js';
import Exercise from '../../models/exercises.js';

// Create a new workout plan
export const createWorkoutPlan = async (req, res) => {
  try {
    const { name, description, difficulty, estimatedDuration, exercises, isPublic, tags } = req.body;
    
    // Validate that all exercise IDs exist
    const exerciseIds = exercises.map(ex => ex.exerciseId);
    const existingExercises = await Exercise.find({ _id: { $in: exerciseIds } });
    
    if (existingExercises.length !== exerciseIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more exercise IDs are invalid'
      });
    }
    
    const newWorkoutPlan = new WorkoutPlan({
      userId: '680bdbbf58c1fa94b816eba5', // Assuming req.user is set by auth middleware
      name,
      description,
      difficulty,
      estimatedDuration,
      exercises,
      isPublic,
      tags
    });
    
    const savedWorkoutPlan = await newWorkoutPlan.save();
    
    res.status(201).json({
      success: true,
      data: savedWorkoutPlan
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


export const getUserWorkoutPlans = async (req, res) => {
  try {
    const { tags, difficulty, search, page = 1, limit = 10 } = req.query;
    console.log("FETCHING WORKOUT PLANS");
    
      // Use req.userId which is set by authenticateToken
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication error: User ID not found'
        });
      }
      
      console.log("Using user ID:", req.userId);
      
      const filter = { userId: req.userId }; 
    
    if (difficulty) filter.difficulty = difficulty;
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray };
    }
    if (search) {
      filter.$text = { $search: search };
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const workoutPlans = await WorkoutPlan.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await WorkoutPlan.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: workoutPlans.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: workoutPlans
    });
  } catch (error) {
    console.error("Error in getUserWorkoutPlans:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// Get all workout plans for the current user
// export const getUserWorkoutPlans = async (req, res) => {
//   try {
//     const { tags, difficulty, search, page = 1, limit = 10 } = req.query;
//     console.log("FETCHING WORKOUT PLANS");
//     // Build filter object
//      console.log(req.user);
//     console.log(req.user.id);
//     const filter = { userId: req.user.id };
    
//     if (difficulty) filter.difficulty = difficulty;
//     if (tags) {
//       const tagArray = tags.split(',').map(tag => tag.trim());
//       filter.tags = { $in: tagArray };
//     }
//     if (search) {
//       filter.$text = { $search: search };
//     }
    
//     // Calculate pagination
//     const skip = (parseInt(page) - 1) * parseInt(limit);
    
//     const workoutPlans = await WorkoutPlan.find(filter)
//       .skip(skip)
//       .limit(parseInt(limit))
//       .sort({ createdAt: -1 });
    
//     const total = await WorkoutPlan.countDocuments(filter);
    
//     res.status(200).json({
//       success: true,
//       count: workoutPlans.length,
//       total,
//       totalPages: Math.ceil(total / parseInt(limit)),
//       currentPage: parseInt(page),
//       data: workoutPlans
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// Get workout plan by ID
export const getWorkoutPlanById = async (req, res) => {
  try {
    const workoutPlan = await WorkoutPlan.findById(req.params.id);
    
    if (!workoutPlan) {
      return res.status(404).json({
        success: false,
        message: 'Workout plan not found'
      });
    }
    
    // Check if user can access this plan (if it's their own or public)
    if (workoutPlan.userId.toString() !== '680bdbbf58c1fa94b816eba5' && !workoutPlan.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This workout plan is private'
      });
    }
    
    // Populate exercise details
    const populatedWorkoutPlan = await WorkoutPlan.findById(req.params.id)
      .populate({
        path: 'exercises.exerciseId',
        model: 'Exercise',
        select: 'name muscleGroup equipment difficulty description formGuidance mediaUrls'
      });
    
    res.status(200).json({
      success: true,
      data: populatedWorkoutPlan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update workout plan
export const updateWorkoutPlan = async (req, res) => {
  try {
    const { name, description, difficulty, estimatedDuration, exercises, isPublic, tags } = req.body;
    
    // Find the workout plan
    const workoutPlan = await WorkoutPlan.findById(req.params.id);
    
    if (!workoutPlan) {
      return res.status(404).json({
        success: false,
        message: 'Workout plan not found'
      });
    }
    
    // Check if user is the owner
    if (workoutPlan.userId.toString() !== '680bdbbf58c1fa94b816eba5') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own workout plans'
      });
    }
    
    // If exercises are updated, validate all exercise IDs
    if (exercises && exercises.length > 0) {
      const exerciseIds = exercises.map(ex => ex.exerciseId);
      const existingExercises = await Exercise.find({ _id: { $in: exerciseIds } });
      
      if (existingExercises.length !== exerciseIds.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more exercise IDs are invalid'
        });
      }
    }
    
    // Update the workout plan
    const updatedWorkoutPlan = await WorkoutPlan.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        difficulty,
        estimatedDuration,
        exercises,
        isPublic,
        tags,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedWorkoutPlan
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete workout plan
export const deleteWorkoutPlan = async (req, res) => {
  try {
    const workoutPlan = await WorkoutPlan.findById(req.params.id);
    
    if (!workoutPlan) {
      return res.status(404).json({
        success: false,
        message: 'Workout plan not found'
      });
    }
    
    // Check if user is the owner
    if (workoutPlan.userId.toString() !== '680bdbbf58c1fa94b816eba5') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own workout plans'
      });
    }
    
    await WorkoutPlan.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Workout plan deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Clone workout plan
export const cloneWorkoutPlan = async (req, res) => {
  try {
    const { name, description } = req.body;
    const originalPlan = await WorkoutPlan.findById(req.params.id);
    
    if (!originalPlan) {
      return res.status(404).json({
        success: false,
        message: 'Workout plan not found'
      });
    }
    
    // Check if user can access this plan to clone it
    if (originalPlan.userId.toString() !== '680bdbbf58c1fa94b816eba5' && !originalPlan.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This workout plan is private'
      });
    }
    
    // Create a new workout plan based on the original
    const newWorkoutPlan = new WorkoutPlan({
      userId: req.user.id,
      name: name || `Copy of ${originalPlan.name}`,
      description: description || originalPlan.description,
      difficulty: originalPlan.difficulty,
      estimatedDuration: originalPlan.estimatedDuration,
      exercises: originalPlan.exercises,
      isPublic: false, // Default to private for cloned plans
      tags: originalPlan.tags
    });
    
    const savedWorkoutPlan = await newWorkoutPlan.save();
    
    res.status(201).json({
      success: true,
      data: savedWorkoutPlan
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get personal workout plans
export const getPersonalWorkoutPlans = async (req, res) => {
  try {
    console.log('Request user object:', JSON.stringify(req.user || {}, null, 2));
    console.log('Request headers:', JSON.stringify(req.headers, null, 2));
    
    if (!req.user) {
      console.log('No user object in request');
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No user found in request.'
      });
    }
    
    // Get user ID from the authenticated request
    const userId = req.user._id || req.user.id;
    console.log('Extracted userId:', userId);
    
    if (!userId) {
      console.log('No userId found in request');
      return res.status(401).json({
        success: false,
        message: 'User ID not found in request'
      });
    }
    
    // Find all workout plans created by the user
    const personalWorkouts = await WorkoutPlan.find({ 
      userId: userId
    }).populate({
      path: 'exercises.exerciseId',
      model: 'Exercise',
      select: 'name muscleGroup equipment difficulty description'
    });
    
    console.log(`Found ${personalWorkouts.length} personal workouts for user ${userId}`);
    
    // Always return a consistent response format
    return res.status(200).json({
      success: true,
      count: personalWorkouts.length,
      data: personalWorkouts
    });
  } catch (error) {
    console.error("Error in getPersonalWorkoutPlans:", error);
    console.error("Error stack:", error.stack);
    
    // Ensure we send a valid JSON response even for errors
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching personal workouts'
    });
  }
};