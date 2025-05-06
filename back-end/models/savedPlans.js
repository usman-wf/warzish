import { Schema, model } from 'mongoose';

const savedPlanSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  workoutPlanId: { 
    type: Schema.Types.ObjectId, 
    ref: 'WorkoutPlan',
    required: true
  },
  folder: { 
    type: String, 
    default: 'Default' 
  },
  savedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Add indexes for better performance
savedPlanSchema.index({ userId: 1 });
savedPlanSchema.index({ folder: 1 });
savedPlanSchema.index({ userId: 1, workoutPlanId: 1 }, { unique: true });

const SavedPlan = model('SavedPlan', savedPlanSchema);

export default SavedPlan;