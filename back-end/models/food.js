import { Schema, model } from 'mongoose';

const FoodSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  calories: {
    type: Number,
    required: true
  },
  protein: {
    type: Number,
    required: true
  },
  carbs: {
    type: Number,
    required: true
  },
  fat: {
    type: Number,
    required: true
  },
  servingSize: {
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true,
      enum: ['g', 'ml', 'oz', 'cup', 'tbsp', 'tsp', 'piece']
    }
  },
  // Optional additional nutritional data
  fiber: Number,
  sugar: Number,
  sodium: Number,
  // For system-provided foods vs. user-created foods
  isCustom: {
    type: Boolean,
    default: true
  },
  // Reference to user who created the food (if custom)
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.isCustom;
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Food = model('Food', FoodSchema);
export default Food;