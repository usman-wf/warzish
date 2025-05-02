import express from 'express';
import { protect } from '../middlewares/authentication.js';

const router = express.Router();

// Personal workouts endpoint - protected by authentication
router.get('/', protect, (req, res) => {
  try {
    console.log('Personal workouts endpoint called');
    console.log('User ID:', req.userId);
    
    // Return test data
    return res.status(200).json({
      success: true,
      count: 2,
      data: [
        {
          _id: 'sample-1',
          name: 'Custom Full Body Blast',
          tags: ['Strength'],
          estimatedDuration: 50,
          difficulty: 'Advanced',
          description: "An intense strength-based full body workout designed for experienced lifters.",
          exercises: [],
          isPublic: false,
          userId: req.userId // Add user ID for ownership
        },
        {
          _id: 'sample-2',
          name: 'Morning Stretch Flow',
          tags: ['Yoga'],
          estimatedDuration: 20,
          difficulty: 'Beginner',
          description: "A gentle stretch routine to improve flexibility and wake up the body.",
          exercises: [],
          isPublic: false,
          userId: req.userId // Add user ID for ownership
        }
      ]
    });
  } catch (error) {
    console.error('Error in personal workouts endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

export default router; 