import SharedWorkout from '../models/SharedWorkout.js';
import Workout from '../models/Workout.js';

// Share a workout
export const shareWorkout = async (req, res) => {
  try {
    const { workoutId, visibility, visibleTo } = req.body;
    
    const workout = await Workout.findById(workoutId);
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    const sharedWorkout = new SharedWorkout({
      originalWorkout: workoutId,
      sharedBy: req.user._id,
      visibility,
      visibleTo: visibleTo || []
    });

    await sharedWorkout.save();
    res.status(201).json(sharedWorkout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get activity feed
export const getActivityFeed = async (req, res) => {
  try {
    const sharedWorkouts = await SharedWorkout.find({
      $or: [
        { visibility: 'public' },
        { visibility: 'connections', visibleTo: req.user._id },
        { sharedBy: req.user._id }
      ]
    })
    .populate('originalWorkout')
    .populate('sharedBy', 'username profilePicture')
    .populate('likes.user', 'username profilePicture')
    .populate('comments.user', 'username profilePicture')
    .sort({ createdAt: -1 });

    res.json(sharedWorkouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like/Unlike a shared workout
export const toggleLike = async (req, res) => {
  try {
    const { sharedWorkoutId } = req.params;
    const sharedWorkout = await SharedWorkout.findById(sharedWorkoutId);
    
    if (!sharedWorkout) {
      return res.status(404).json({ message: 'Shared workout not found' });
    }

    const likeIndex = sharedWorkout.likes.findIndex(
      like => like.user.toString() === req.user._id.toString()
    );

    if (likeIndex === -1) {
      // Add like
      sharedWorkout.likes.push({ user: req.user._id });
    } else {
      // Remove like
      sharedWorkout.likes.splice(likeIndex, 1);
    }

    await sharedWorkout.save();
    res.json(sharedWorkout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add comment to shared workout
export const addComment = async (req, res) => {
  try {
    const { sharedWorkoutId } = req.params;
    const { content } = req.body;

    const sharedWorkout = await SharedWorkout.findById(sharedWorkoutId);
    if (!sharedWorkout) {
      return res.status(404).json({ message: 'Shared workout not found' });
    }

    sharedWorkout.comments.push({
      user: req.user._id,
      content
    });

    await sharedWorkout.save();
    res.json(sharedWorkout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 