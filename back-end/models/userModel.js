import { Schema, model } from 'mongoose';
import { genSalt, hash, compare } from 'bcryptjs';

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },

  username: { type: String, unique: true, required: true },
  password: {
    type: String,
    required: true
  },
  // Nutrition-specific fields
  height: {
    value: Number,
    unit: {
      type: String,
      enum: ['cm', 'in'],
      default: 'cm'
    }
  },
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['kg', 'lb'],
      default: 'kg'
    }
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  nutritionGoal: {
    type: String,
    enum: ['lose_weight', 'maintain', 'gain_weight', 'improve_health']
  },
  nutritionTargets: {
    calories: {
      type: Number,
      default: 2000
    },
    protein: {
      type: Number,
      default: 50
    },
    carbs: {
      type: Number,
      default: 250
    },
    fat: {
      type: Number,
      default: 70
    }
  },
  dietaryPreferences: {
    type: [String],
    enum: ['vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'keto', 'paleo', 'none']
  },
  profile: {
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    age: {
      type: Number,
      min: 0
    },
    weight: {
      type: Number,
      min: 0
    },
    height: {
      type: Number,
      min: 0
    },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
      default: 'sedentary'
    },
    goal: {
      type: String,
      enum: ['lose', 'maintain', 'gain'],
      default: 'maintain'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Password hashing middleware
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await genSalt(10);
    this.password = await hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await compare(candidatePassword, this.password);
};

const User = model('User', UserSchema);
export default User;