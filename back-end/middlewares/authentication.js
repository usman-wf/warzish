
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import process from 'process';
import dotenv from 'dotenv';
dotenv.config({ path: './config/config.env' }); 
// Protect routes
export const protect = async (req, res, next) => {
  let token;

  // Check if token exists in header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token decoded successfully:", decoded.id);

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        console.log("No user found with ID:", decoded.id);
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Set up req.user with both _id and id for compatibility
      req.user = user;
      
      // Ensure id is available as a string
      if (!req.user.id && req.user._id) {
        req.user.id = req.user._id.toString();
      }
      
      next();
    } catch (error) {
      console.error("Auth error:", error);
      res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  } else {
    res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
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