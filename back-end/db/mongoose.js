import mongoose from 'mongoose';

//LOCAL DB SETTING TEMPORARY
const uri = "mongodb+srv://usman:g%40*K8.tkp223Hf_@warzish.u11vzho.mongodb.net/warzishPlanner?retryWrites=true&w=majority&appName=Warzish";

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