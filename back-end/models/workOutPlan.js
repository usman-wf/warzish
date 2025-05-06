
import { Schema, model } from 'mongoose';

const workoutPlanSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true
  },
  difficulty: { 
    type: String, 
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  estimatedDuration: { 
    type: Number, 
    required: true,
    min: 1
  },
  exercises: [
    {
      exerciseId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Exercise',
        required: true
      },
      sets: { 
        type: Number, 
        min: 1 
      },
      reps: { 
        type: Number, 
        min: 0 
      },
      duration: { 
        type: Number, 
        min: 0 
      },
      restBetweenSets: { 
        type: Number, 
        default: 60 
      },
      notes: { 
        type: String 
      }
    }
  ],
  isPublic: { 
    type: Boolean, 
    default: false 
  },
  tags: [{ 
    type: String 
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Add indexes for common queries
workoutPlanSchema.index({ userId: 1 });
workoutPlanSchema.index({ name: 'text', description: 'text' });
workoutPlanSchema.index({ tags: 1 });
workoutPlanSchema.index({ difficulty: 1 });
workoutPlanSchema.index({ isPublic: 1 });

const WorkoutPlan = model('WorkoutPlan', workoutPlanSchema);

export default WorkoutPlan;