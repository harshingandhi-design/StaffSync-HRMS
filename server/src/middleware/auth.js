import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'staffsync_fallback_secret');
    const user = await User.findById(decoded.id).populate('employeeProfile');

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User account not found or has been deactivated.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Session expired or token invalid. Please log in again.' });
  }
});

// Role-based access control
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: Access restricted to roles [${roles.join(', ')}]. Your role is '${req.user?.role || 'Guest'}'.`,
      });
    }
    next();
  };
};
