import mongoose from 'mongoose';

const workoutHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workoutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workout',
    required: false
  },
  date: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  workoutType: {
    type: String,
    required: true
  },
  exercises: [{
    name: String,
    sets: [{
      reps: Number,
      weight: Number,
      completed: Boolean
    }]
  }],
  intensityLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true
  },
  notes: String,
  difficultyRating: {
    type: Number,
    min: 1,
    max: 10
  },
  location: {
    type: String,
    enum: ['Gym', 'Home', 'Outdoor']
  }
}, {
  timestamps: true
});

// Index for efficient querying
workoutHistorySchema.index({ userId: 1, date: -1 });
workoutHistorySchema.index({ workoutType: 1 });

const WorkoutHistory = mongoose.model('WorkoutHistory', workoutHistorySchema);

export default WorkoutHistory; 