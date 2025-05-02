import { Router } from 'express';
import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const router = Router();

// Use environment variable for JWT secret or fallback to a default (for development only)
const JWT_SECRET = 'qwertyuiodfghjklzxcvbnm1234567890'; // Should use env var in production

////ROUTE  ROUTES AS EXAMPLE : /LOCALHOST:3000/api/signup

router.post('/signup', async (req, res) => {
    const { name, username, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Create a new user instance
        const newUser = new User({ name, username, email, password });
        // Save the user to the database
        await newUser.save();
        
        // Generate token for auto-login after signup
        const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '24h' });
        
        // Send success response with token
        res.status(201).json({ 
            message: 'User created successfully',
            token
        });
    } catch (error) {
        // Check if the error is a validation error
        if (error.name === 'ValidationError') {
            // Validation failed, return a 400 Bad Request response with validation errors
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ errors: validationErrors });
        }
        // Other errors (e.g., database error), return a 500 Internal Server Error response
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });

        // Send token as part of the login response
        res.status(200).json({ 
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized: Token not provided' });
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : authHeader;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Get full user document and attach to request
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        
        req.user = user;
        req.userId = user._id;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Unauthorized: Invalid token' });
    }
};

// Add a test protected route
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Export both router and middleware
export { router, authenticateToken };


