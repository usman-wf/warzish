import { Schema, model } from 'mongoose';

const MealEntrySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  mealType: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'dinner', 'snack']
  },
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
  
  caloriesConsumed: Number,
  proteinConsumed: Number,
  carbsConsumed: Number,
  fatConsumed: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Method to calculate nutritional values based on quantity and food
MealEntrySchema.pre('save', async function(next) {
  try {
    // Only recalculate if food or quantity has changed
    if (this.isModified('food') || this.isModified('quantity')) {
      const Food = model('Food');
      const food = await Food.findById(this.food);
      
      if (!food) {
        throw new Error('Food not found');
      }
      
      // Calculate consumed values based on quantity
      this.caloriesConsumed = food.calories * this.quantity;
      this.proteinConsumed = food.protein * this.quantity;
      this.carbsConsumed = food.carbs * this.quantity;
      this.fatConsumed = food.fat * this.quantity;
    }
    next();
  } catch (error) {
    next(error);
  }
});

const MealEntry = model('MealEntry', MealEntrySchema);
export default MealEntry;