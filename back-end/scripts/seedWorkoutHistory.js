import mongoose from 'mongoose';
import WorkoutHistory from '../models/WorkoutHistory.js';

// Hardcoded MongoDB URI with explicit database name
const MONGODB_URI = 'mongodb+srv://abtariq:techislife7@warzish.u11vzho.mongodb.net/warzishPlanner?retryWrites=true&w=majority&appName=Warzish';

const sampleWorkouts = [
  {
    workoutType: 'Strength',
    duration: 60,
    exercises: [
      {
        name: 'Bench Press',
        sets: [
          { reps: 10, weight: 60, completed: true },
          { reps: 10, weight: 65, completed: true },
          { reps: 8, weight: 70, completed: true }
        ]
      },
      {
        name: 'Squats',
        sets: [
          { reps: 12, weight: 80, completed: true },
          { reps: 10, weight: 85, completed: true },
          { reps: 8, weight: 90, completed: true }
        ]
      }
    ],
    intensityLevel: 'High',
    notes: 'Great workout, felt strong today',
    difficultyRating: 8,
    location: 'Gym'
  },
  {
    workoutType: 'Cardio',
    duration: 45,
    exercises: [
      {
        name: 'Running',
        sets: [
          { reps: 1, weight: 0, completed: true }
        ]
      },
      {
        name: 'Jump Rope',
        sets: [
          { reps: 1, weight: 0, completed: true }
        ]
      }
    ],
    intensityLevel: 'Medium',
    notes: 'Good cardio session',
    difficultyRating: 6,
    location: 'Outdoor'
  },
  {
    workoutType: 'HIIT',
    duration: 30,
    exercises: [
      {
        name: 'Burpees',
        sets: [
          { reps: 15, weight: 0, completed: true },
          { reps: 15, weight: 0, completed: true },
          { reps: 15, weight: 0, completed: true }
        ]
      },
      {
        name: 'Mountain Climbers',
        sets: [
          { reps: 20, weight: 0, completed: true },
          { reps: 20, weight: 0, completed: true },
          { reps: 20, weight: 0, completed: true }
        ]
      }
    ],
    intensityLevel: 'High',
    notes: 'Intense HIIT session',
    difficultyRating: 9,
    location: 'Home'
  }
];

const seedWorkoutHistory = async (userId) => {
  try {
    // Connect to MongoDB using hardcoded URI
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create workout history entries for the last 30 days
    const workoutPromises = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Randomly select a workout type
      const workout = {
        ...sampleWorkouts[Math.floor(Math.random() * sampleWorkouts.length)],
        userId,
        date,
        workoutId: new mongoose.Types.ObjectId() // Generate a random workout ID
      };
      
      workoutPromises.push(WorkoutHistory.create(workout));
    }

    await Promise.all(workoutPromises);
    console.log('Successfully seeded workout history data');

  } catch (error) {
    console.error('Error seeding workout history:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Get userId from command line argument
const userId = process.argv[2];
if (!userId) {
  console.error('Please provide a userId as a command line argument');
  process.exit(1);
}

seedWorkoutHistory(userId); 