import mongoose from 'mongoose';

//LOCAL DB SETTING TEMPORARY
const uri = "mongodb://localhost:27017/warzishPlanner";

// Connect to MongoDB with Mongoose
async function connectToMongoDB() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB via Mongoose');
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export default connectToMongoDB;