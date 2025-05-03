import express from 'express';
import process from 'process';
import { router } from './routes/authRoutes.js';
import exerciseRouter from './routes/exercise.js';
import foodRouter from './routes/food.js';
import profileRouter from './routes/profileRoutes.js';

import dotenv from 'dotenv';
dotenv.config({ path: './config/config.env' }); // Load environment variables from config.env file
import cors from "cors";

const PORT = 3030;
const app = express();
app.use(express.json());
app.use(cors());
app.use('/api', router);
app.use('/exercise', exerciseRouter)
app.use('/food', foodRouter);
app.use('/api/user', profileRouter);

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB using Mongoose:
import connectToMongoDB from './db/mongoose.js';
async function startServer() {
  try {
    await connectToMongoDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();



