import mongoose from 'mongoose';

//LOCAL DB SETTING TEMPORARY
const uri = "mongodb+srv://abtariq:techislife7@warzish.u11vzho.mongodb.net/?retryWrites=true&w=majority&appName=Warzish";

// Connect to MongoDB with Mongoose
async function connectToMongoDB() {
  try {
    await mongoose.connect(uri, { dbName: 'warzishPlanner' });
    console.log('Connected to MongoDB via Mongoose');
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
} 

export default connectToMongoDB; 