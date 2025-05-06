import { Schema, model } from 'mongoose';

const exerciseSchema = new Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  muscleGroup: { 
    type: String, 
    required: true,
    trim: true
  },
  equipment: { 
    type: String, 
    required: true,
    trim: true
  },
  difficulty: { 
    type: String, 
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  description: { 
    type: String, 
    required: true
  },
  formGuidance: { 
    type: String, 
    required: true
  },
  mediaUrls: [{ 
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
exerciseSchema.index({ name: 'text', description: 'text' });
exerciseSchema.index({ muscleGroup: 1 });
exerciseSchema.index({ difficulty: 1 });
exerciseSchema.index({ equipment: 1 });

const Exercise = model('Exercise', exerciseSchema);

export default Exercise;