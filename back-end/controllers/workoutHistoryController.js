import WorkoutHistory from '../models/WorkoutHistory.js';

// Create a new workout history entry
export const createWorkoutHistory = async (req, res) => {
  try {
    const workoutHistory = new WorkoutHistory({
      ...req.body,
      userId: req.user._id
    });
    await workoutHistory.save();
    res.status(201).json(workoutHistory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get workout history with filters
export const getWorkoutHistory = async (req, res) => {
  try {
    console.log('Getting workout history for user:', req.user._id);
    const { startDate, endDate, workoutType, exercise } = req.query;
    const query = { userId: req.user._id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (workoutType) {
      query.workoutType = workoutType;
    }

    if (exercise) {
      query['exercises.name'] = exercise;
    }

    console.log('Query:', JSON.stringify(query, null, 2));
    const workoutHistory = await WorkoutHistory.find(query)
      .sort({ date: -1 });
    
    console.log('Found workouts:', workoutHistory.length);
    res.json(workoutHistory);
  } catch (error) {
    console.error('Error in getWorkoutHistory:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get workout statistics
export const getWorkoutStats = async (req, res) => {
  try {
    const { period } = req.query; // 'week' or 'month'
    const startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else {
      startDate.setMonth(startDate.getMonth() - 1);
    }

    const stats = await WorkoutHistory.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalWorkouts: { $sum: 1 },
          avgDuration: { $avg: '$duration' },
          workoutTypes: { $addToSet: '$workoutType' },
          exercises: { $push: '$exercises.name' }
        }
      }
    ]);

    // If no workouts found, return default stats
    if (!stats || stats.length === 0) {
      return res.json({
        totalWorkouts: 0,
        avgDuration: 0,
        uniqueWorkoutTypes: 0,
        mostCommonExercises: []
      });
    }

    // Calculate most common exercises
    const exerciseCount = {};
    stats[0].exercises.flat().forEach(exercise => {
      if (exercise) { // Only count if exercise name exists
        exerciseCount[exercise] = (exerciseCount[exercise] || 0) + 1;
      }
    });

    const mostCommonExercises = Object.entries(exerciseCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    res.json({
      totalWorkouts: stats[0].totalWorkouts || 0,
      avgDuration: Math.round(stats[0].avgDuration || 0),
      uniqueWorkoutTypes: (stats[0].workoutTypes || []).length,
      mostCommonExercises
    });
  } catch (error) {
    console.error('Error getting workout stats:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get weight progression for specific exercise
export const getWeightProgression = async (req, res) => {
  try {
    const { exercise } = req.params;
    const progression = await WorkoutHistory.find({
      userId: req.user._id,
      'exercises.name': exercise
    })
    .select('date exercises')
    .sort({ date: 1 });

    const weightData = progression.map(workout => {
      const exerciseData = workout.exercises.find(e => e.name === exercise);
      return {
        date: workout.date,
        weights: exerciseData.sets.map(set => set.weight)
      };
    });

    res.json(weightData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 