import express from 'express';
import process from 'process';
import { router, authenticateToken } from './routes/authRoutes.js';
import exerciseRouter from './routes/exercise.js';
import foodRouter from './routes/food.js';
import profileRouter from './routes/profileRoutes.js';

import dotenv from 'dotenv';
dotenv.config({ path: './config/config.env' }); // Load environment variables from config.env file
import cors from "cors";

const PORT = 3030;
const app = express();

// Configure CORS before any middleware runs
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
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

app.use('/api', router);
app.use('/exercise', exerciseRouter)
app.use('/food', foodRouter);
app.use('/api/user', profileRouter);

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
app.use((err, req, res) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Server error', message: err.message });
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



