import { Schema, model } from 'mongoose';

const MealPlanItemSchema = new Schema({
  food: {
    type: Schema.Types.ObjectId,
    ref: 'Food',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0.01
  },
  mealType: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'dinner', 'snack']
  }
});

const MealPlanSchema = new Schema({
  user: {
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
    trim: true
  },
  targetCalories: Number,
  // Weekday availability (which days this plan is for)
  weekdays: {
    type: [String],
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  },
  meals: [MealPlanItemSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to update the updatedAt timestamp
MealPlanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual property for total calories in the meal plan
MealPlanSchema.virtual('totalCalories').get(function() {
  // This would need to be populated properly when querying
  return this.meals.reduce((total, meal) => {
    return total + meal.food.calories * meal.quantity;
  }, 0);
});

const MealPlan = model('MealPlan', MealPlanSchema);
export default MealPlan;