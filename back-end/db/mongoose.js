import mongoose from 'mongoose';
import Food from '../models/food.js';

//LOCAL DB SETTING TEMPORARY
const uri = "mongodb+srv://abtariq:techislife7@warzish.u11vzho.mongodb.net/?retryWrites=true&w=majority&appName=Warzish";

// Default system foods to be added if collection is empty
const defaultFoods = [
  {
    name: 'Chicken Breast',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    servingSize: {
      value: 100,
      unit: 'g'
    },
    fiber: 0,
    sugar: 0,
    sodium: 74,
    isCustom: false
  },
  {
    name: 'Brown Rice',
    calories: 112,
    protein: 2.6,
    carbs: 23.5,
    fat: 0.9,
    servingSize: {
      value: 100,
      unit: 'g'
    },
    fiber: 1.8,
    sugar: 0.4,
    sodium: 5,
    isCustom: false
  },
  {
    name: 'Broccoli',
    calories: 34,
    protein: 2.8,
    carbs: 6.6,
    fat: 0.4,
    servingSize: {
      value: 100,
      unit: 'g'
    },
    fiber: 2.6,
    sugar: 1.7,
    sodium: 33,
    isCustom: false
  }
];

// Initialize default data if collection is empty
async function initializeData() {
  try {
    const count = await Food.countDocuments();
    console.log(`Found ${count} existing food items`);
    
    // If no foods exist, add default foods
    if (count === 0) {
      console.log('Adding default foods...');
      await Food.insertMany(defaultFoods);
      console.log(`Added ${defaultFoods.length} default foods`);
    }
  } catch (error) {
    console.error('Error initializing food data:', error);
  }
}

// Connect to MongoDB with Mongoose
async function connectToMongoDB() {
  try {
    await mongoose.connect(uri, { dbName: 'warzishPlanner' });
    console.log('Connected to MongoDB via Mongoose');
    
    // Initialize default data after connection
    await initializeData();
    
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
} 

export default connectToMongoDB; 