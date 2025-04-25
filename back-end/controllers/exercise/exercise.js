import Exercise from '../models/exerciseModel.js';

// Create a new exercise
export const createExercise = async (req, res) => {
  try {
    const { name, muscleGroup, equipment, difficulty, description, formGuidance, mediaUrls } = req.body;
    
    const newExercise = new Exercise({
      name,
      muscleGroup,
      equipment,
      difficulty,
      description,
      formGuidance,
      mediaUrls
    });
    
    const savedExercise = await newExercise.save();
    
    res.status(201).json({
      success: true,
      data: savedExercise
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all exercises with filtering and pagination
export const getAllExercises = async (req, res) => {
  try {
    const { muscleGroup, equipment, difficulty, search, page = 1, limit = 20 } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (muscleGroup) filter.muscleGroup = muscleGroup;
    if (equipment) filter.equipment = equipment;
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.$text = { $search: search };
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const exercises = await Exercise.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ name: 1 });
    
    const total = await Exercise.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: exercises.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: exercises
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get exercise by ID
export const getExerciseById = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: exercise
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update exercise by ID
export const updateExercise = async (req, res) => {
  try {
    const { name, muscleGroup, equipment, difficulty, description, formGuidance, mediaUrls } = req.body;
    
    const exercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      {
        name,
        muscleGroup,
        equipment,
        difficulty,
        description,
        formGuidance,
        mediaUrls,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );
    
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: exercise
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete exercise by ID
export const deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndDelete(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Exercise deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};