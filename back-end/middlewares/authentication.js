import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import process from 'process';
import dotenv from 'dotenv';
dotenv.config({ path: './config/config.env' }); 

// Set a default JWT_SECRET if not provided in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'qwertyuiodfghjklzxcvbnm1234567890'; // Should use env var in production

// Protect routes
export const protect = async (req, res, next) => {
  let token;

  try {
    console.log('=== PROTECT MIDDLEWARE CALLED ===');
    console.log('Headers:', JSON.stringify(req.headers));

    // Check if token exists in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        // Get token from header
        token = req.headers.authorization.split(' ')[1];
        console.log('Token received:', token.substring(0, 20) + '...');

        if (!token) {
          console.log('Token is empty after extraction');
          return res.status(401).json({
            success: false,
            message: 'Not authorized, token is empty'
          });
        }

        // Verify token
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          console.log("Token decoded successfully:", decoded);
          
          // Get user from token - Handle both userId and id formats
          const userId = decoded.id || decoded.userId;
          
          if (!userId) {
            console.log("No user ID found in token:", decoded);
            return res.status(401).json({
              success: false,
              message: 'Invalid token format - no user ID'
            });
          }
          
          console.log("Looking up user with ID:", userId);
          const user = await User.findById(userId).select('-password');
          
          if (!user) {
            console.log("No user found with ID:", userId);
            return res.status(401).json({
              success: false,
              message: 'User not found'
            });
          }
          
          console.log('Found user:', user);
          
          // Set up req.user with both _id and id for compatibility
          // Convert to plain object to ensure we can add properties
          req.user = user.toObject ? user.toObject() : { ...user };
          
          // Critical fix: Ensure id is available as a string for compatibility
          if (!req.user.id) {
            req.user.id = req.user._id.toString();
          }
          
          console.log('User ID set to:', req.user.id);
          console.log('=== PROTECT MIDDLEWARE SUCCESSFUL ===');
          
          next();
        } catch (jwtError) {
          console.error("JWT verification error:", jwtError);
          // Handle specific JWT errors
          if (jwtError.name === 'JsonWebTokenError') {
            return res.status(401).json({
              success: false,
              message: 'Invalid token signature'
            });
          }
          
          if (jwtError.name === 'TokenExpiredError') {
            return res.status(401).json({
              success: false,
              message: 'Token expired'
            });
          }
          
          throw jwtError; // Re-throw for the outer catch block
        }
      } catch (error) {
        console.error("Auth error:", error);
        console.error("Auth error stack:", error.stack);
        
        if (error.name === 'JsonWebTokenError') {
          return res.status(401).json({
            success: false,
            message: 'Invalid token'
          });
        }
        
        if (error.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message: 'Token expired'
          });
        }
        
        res.status(401).json({
          success: false,
          message: 'Not authorized, token failed',
          error: error.message
        });
      }
    } else {
      console.log('No authorization header found or incorrect format');
      console.log('Authorization header:', req.headers.authorization);
      res.status(401).json({
        success: false,
        message: 'Not authorized, no token or incorrect format'
      });
    }
  } catch (error) {
    console.error("Global protect middleware error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication',
      error: error.message
    });
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user.role || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};