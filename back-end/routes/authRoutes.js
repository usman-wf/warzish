const express = require('express');
const User = require('../models/userModel'); // Import the User model
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/signup', async (req, res) => {
    const { name, username, email, password } = req.body;

    try {
        // Create a new user instance
        const newUser = new User({ name, username, email, password });
        // Save the user to the database
        await newUser.save();
        // Send a success response
        res.status(201).json({ message: 'User created successfully' });
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
        // Check user credentials (authenticate user)
        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });

        // Send token as part of the login response
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// Middleware to authenticate requests
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: Token not provided' });
    }

    jwt.verify(token, 'your-secret-key', (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Unauthorized: Invalid token' });
        }
        req.userId = decoded.userId;
        next();
    });
};

module.exports = { router, authenticateToken };
