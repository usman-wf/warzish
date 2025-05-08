import express from 'express';
import process from 'process';
import { router, authenticateToken } from './routes/authRoutes.js';
import exerciseRouter from './routes/exercise.js';
import foodRouter from './routes/food.js';
import profileRouter from './routes/profileRoutes.js';
import tweetRouter from './routes/tweetRoutes.js';
import workoutHistoryRouter from './routes/workoutHistory.js';
import socialRouter from './routes/social.js';

import dotenv from 'dotenv';
dotenv.config({ path: './config/config.env' }); // Load environment variables from config.env file
import cors from "cors";

const PORT = 3030;
const app = express();

// Configure CORS before any middleware runs
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.headers.authorization) {
    console.log('Authorization header present');
  }
  next();
});

app.use(express.json());

// Add direct verify-token endpoint at root level for frontend compatibility
app.get('/verify-token', authenticateToken, (req, res) => {
  // If we get here, the token is valid and req.user is populated
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    }
  });
});

// Mount routes
app.use('/api', router);
app.use('/api/workout-history', workoutHistoryRouter);
app.use('/exercise', exerciseRouter);
app.use('/food', foodRouter);
app.use('/api/profile', profileRouter);
app.use('/api/tweets', tweetRouter);
app.use('/api/social', socialRouter);

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Create the uploads directory if it doesn't exist
import fs from 'fs';
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
  console.log('Created uploads directory');
}

// Handle 404s
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => { // Added 'next' parameter to fix the error handler
  console.error('Server error:', err);
  console.error('Error stack:', err.stack);
  console.error('Request path:', req.path);
  console.error('Request method:', req.method);
  console.error('Request body:', JSON.stringify(req.body, null, 2));
  
  // Ensure we have a valid response status
  const status = res.statusCode !== 200 ? res.statusCode : 500;
  
  // Send proper error response
  res.status(status).json({ 
    error: 'Server error', 
    message: err.message,
    path: req.path,
    method: req.method
  });
});

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