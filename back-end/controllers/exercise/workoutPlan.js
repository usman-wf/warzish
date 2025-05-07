import WorkoutPlan from '../../models/workoutPlan.js';
import SavedWorkout from '../../models/savedWorkout.js';
import { AppError } from '../../utils/appError.js';

// Create a new workout plan
export const createWorkoutPlan = async (req, res, next) => {
  try {
    const workoutData = {
      ...req.body,
      userId: req.user._id,
      isPublic: false // Default to personal workout
    };

    const workout = await WorkoutPlan.create(workoutData);
    
    res.status(201).json({
      status: 'success',
      data: workout
    });
  } catch (error) {
    next(new AppError('Failed to create workout plan', 500));
  }
};

// Get all public workout plans
export const getPublicWorkoutPlans = async (req, res, next) => {
  try {
    const publicWorkouts = await WorkoutPlan.find({ isPublic: true })
      .populate('exercises.exerciseId')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      data: publicWorkouts
    });
  } catch (error) {
    next(new AppError('Failed to fetch public workouts', 500));
  }
};

// Get a specific public workout plan
export const getPublicWorkoutPlanById = async (req, res, next) => {
  try {
    const workout = await WorkoutPlan.findOne({
      _id: req.params.id,
      isPublic: true
    }).populate('exercises.exerciseId');

    if (!workout) {
      return next(new AppError('Public workout not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: workout
    });
  } catch (error) {
    next(new AppError('Failed to fetch public workout', 500));
  }
};

// Get user's personal workout plans
export const getUserWorkoutPlans = async (req, res, next) => {
  try {
    const workouts = await WorkoutPlan.find({ 
      userId: req.user._id,
      isPublic: false 
    })
      .populate('exercises.exerciseId')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      data: workouts
    });
  } catch (error) {
    next(new AppError('Failed to fetch user workouts', 500));
  }
};

// Get a specific workout plan
export const getWorkoutPlanById = async (req, res, next) => {
  try {
    const workout = await WorkoutPlan.findOne({
      _id: req.params.id,
      $or: [
        { userId: req.user._id },
        { isPublic: true }
      ]
    }).populate('exercises.exerciseId');

    if (!workout) {
      return next(new AppError('Workout not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: workout
    });
  } catch (error) {
    next(new AppError('Failed to fetch workout', 500));
  }
};

// Update a workout plan
export const updateWorkoutPlan = async (req, res, next) => {
  try {
    const workout = await WorkoutPlan.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isPublic: false // Only allow updates to personal workouts
    });

    if (!workout) {
      return next(new AppError('Workout not found or not authorized to update', 404));
    }

    const updatedWorkout = await WorkoutPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('exercises.exerciseId');

    res.status(200).json({
      status: 'success',
      data: updatedWorkout
    });
  } catch (error) {
    next(new AppError('Failed to update workout plan', 500));
  }
};

// Delete a workout plan
export const deleteWorkoutPlan = async (req, res, next) => {
  try {
    const workout = await WorkoutPlan.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isPublic: false // Only allow deletion of personal workouts
    });

    if (!workout) {
      return next(new AppError('Workout not found or not authorized to delete', 404));
    }

    await WorkoutPlan.findByIdAndDelete(req.params.id);

    // Also remove from saved workouts if it exists
    await SavedWorkout.deleteMany({ workoutId: req.params.id });

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(new AppError('Failed to delete workout plan', 500));
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
    if (originalPlan.userId.toString() !== req.user.id && !originalPlan.isPublic) {
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