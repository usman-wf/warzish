import express from 'express';
import process from 'process';
import { router } from './routes/authRoutes.js';
import exerciseRouter from './routes/exercise.js';
import foodRouter from './routes/food.js';
import personalWorkoutsRouter from './routes/personalWorkouts.js';

import dotenv from 'dotenv';
dotenv.config({ path: './config/config.env' }); // Load environment variables from config.env file
import cors from "cors";


const PORT = process.env.PORT || 3030;
const app = express();
app.use(express.json());
app.use(cors());

// Special route for personal workouts - registered first to avoid middleware issues
app.use('/exercise/personal-workouts', personalWorkoutsRouter);

// Register other routes
app.use('/api', router);
app.use('/exercise', exerciseRouter);
app.use('/food', foodRouter);


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

// Error handling middleware
/* eslint-disable-next-line no-unused-vars */
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);
  console.error(err.stack);
  
  // Check if headers have already been sent
  if (res.headersSent) {
    console.error('Headers already sent, cannot send error response');
    return next(err);
  }
  
  // Return a proper JSON response
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});



