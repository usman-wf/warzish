import { Schema, model } from 'mongoose';

const DailyTargetSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Base metabolic rate (calculated or user-specified)
  bmr: {
    type: Number,
    required: true
  },
  // Daily calorie target
  calorieTarget: {
    type: Number,
    required: true
  },
  // Macronutrient targets (in grams)
  proteinTarget: {
    type: Number,
    required: true
  },
  carbTarget: {
    type: Number,
    required: true
  },
  fatTarget: {
    type: Number,
    required: true
  },
  // Optional additional targets
  fiberTarget: Number,
  sugarTarget: Number,
  sodiumTarget: Number,
  waterTarget: Number,
  // Activity level multiplier for TDEE calculation
  activityMultiplier: {
    type: Number,
    default: 1.2,
    min: 1.0,
    max: 2.5
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const DailyTarget = model('DailyTarget', DailyTargetSchema);
export default DailyTarget;