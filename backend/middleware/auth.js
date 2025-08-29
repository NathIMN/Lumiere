import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { createCustomError } from "../errors/custom-error.js";
import asyncWrapper from "./async.js";

// Verify JWT token and authenticate user
export const authenticate = asyncWrapper(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(createCustomError("No token provided, access denied", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(createCustomError("User not found, invalid token", 401));
    }

    if (user.status !== "active") {
      return next(createCustomError("Account is not active", 403));
    }

    // Add user info to request object
    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(createCustomError("Invalid token", 401));
    }
    if (error.name === "TokenExpiredError") {
      return next(createCustomError("Token expired", 401));
    }
    return next(createCustomError("Token verification failed", 401));
  }
});

// Authorize based on user roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createCustomError("Access denied, authentication required", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(createCustomError("Access denied, insufficient permissions", 403));
    }

    next();
  };
};

// Check if user owns the resource or has admin/hr privileges
export const authorizeOwnerOrAdmin = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { userId, role } = req.user;

  // Admins and HR can access any user's data
  if (role === "admin" || role === "hr_officer") {
    return next();
  }

  // Users can only access their own data
  if (id === userId.toString()) {
    return next();
  }

  return next(createCustomError("Access denied, can only access your own data", 403));
});