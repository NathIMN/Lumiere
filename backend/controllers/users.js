import User from "../models/User.js";
import asyncWrapper from "../middleware/async.js";
import { createCustomError } from "../errors/custom-error.js";
import jwt from "jsonwebtoken";

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// Register user
const registerUser = asyncWrapper(async (req, res, next) => {
  const { email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(createCustomError("User with this email already exists", 400));
  }

  // Create user (password will be hashed by middleware)
  const user = await User.create(req.body);

  // Generate token
  const token = generateToken(user._id);

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: userResponse,
    token,
  });
});

// Login user
const loginUser = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(createCustomError("Please provide email and password", 400));
  }

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select("+password");
  
  if (!user) {
    return next(createCustomError("Invalid email or password", 401));
  }

  // Check if account is locked
  if (user.isLocked) {
    return next(createCustomError("Account is temporarily locked due to too many failed attempts", 423));
  }

  // Compare password
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    // Increment login attempts
    user.loginAttempts += 1;
    
    // Lock account after 5 failed attempts for 30 minutes
    if (user.loginAttempts >= 5) {
      user.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
    }
    
    await user.save();
    return next(createCustomError("Invalid email or password", 401));
  }

  // Reset login attempts and lock on successful login
  if (user.loginAttempts > 0) {
    user.loginAttempts = 0;
    user.lockUntil = undefined;
  }
  
  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = generateToken(user._id);

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(200).json({
    success: true,
    message: "Login successful",
    user: userResponse,
    token,
  });
});

// Get current user profile
const getProfile = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.user.userId);
  
  if (!user) {
    return next(createCustomError("User not found", 404));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// Update user profile
const updateProfile = asyncWrapper(async (req, res, next) => {
  const { userId } = req.user;
  
  // Prevent updating sensitive fields
  const restrictedFields = ["userId", "role", "password", "loginAttempts", "lockUntil"];
  restrictedFields.forEach(field => delete req.body[field]);

  const user = await User.findByIdAndUpdate(userId, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(createCustomError(`No user with id: ${userId}`, 404));
  }

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user,
  });
});

// Change password
const changePassword = asyncWrapper(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const { userId } = req.user;

  if (!currentPassword || !newPassword) {
    return next(createCustomError("Please provide current and new password", 400));
  }

  // Get user with password
  const user = await User.findById(userId).select("+password");
  
  if (!user) {
    return next(createCustomError("User not found", 404));
  }

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return next(createCustomError("Current password is incorrect", 400));
  }

  // Update password (will be hashed by middleware)
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

// Reset password (admin only)
const resetPassword = asyncWrapper(async (req, res, next) => {
  const { id: targetUserId } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return next(createCustomError("Please provide new password", 400));
  }

  const user = await User.findById(targetUserId);
  if (!user) {
    return next(createCustomError(`No user with id: ${targetUserId}`, 404));
  }

  // Update password (will be hashed by middleware)
  user.password = newPassword;
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
});

// Get all users (admin/hr only)
const getAllUsers = asyncWrapper(async (req, res) => {
  const { role, status, department } = req.query;
  let query = {};

  if (role) query.role = role;
  if (status) query.status = status;
  if (department) query["employment.department"] = department;

  const users = await User.find(query);
  
  res.status(200).json({
    success: true,
    count: users.length,
    users,
  });
});

// Get user by ID (admin/hr only)
const getUserById = asyncWrapper(async (req, res, next) => {
  const { id: userId } = req.params;
  
  const user = await User.findById(userId);
  if (!user) {
    return next(createCustomError(`No user with id: ${userId}`, 404));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// Create user (admin/hr only)
const createUser = asyncWrapper(async (req, res, next) => {
  const { email } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(createCustomError("User with this email already exists", 400));
  }

  const user = await User.create(req.body);
  
  res.status(201).json({
    success: true,
    message: "User created successfully",
    user,
  });
});

// Update user (admin/hr only)
const updateUser = asyncWrapper(async (req, res, next) => {
  const { id: userId } = req.params;

  // Prevent updating password through this route
  delete req.body.password;

  const user = await User.findByIdAndUpdate(userId, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(createCustomError(`No user with id: ${userId}`, 404));
  }

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    user,
  });
});

// Delete user (admin only)
const deleteUser = asyncWrapper(async (req, res, next) => {
  const { id: userId } = req.params;
  
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    return next(createCustomError(`No user with id: ${userId}`, 404));
  }

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
    user,
  });
});

// Update user status (admin/hr only)
const updateUserStatus = asyncWrapper(async (req, res, next) => {
  const { id: userId } = req.params;
  const { status } = req.body;

  if (!status || !["active", "inactive", "suspended", "terminated"].includes(status)) {
    return next(createCustomError("Please provide a valid status", 400));
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { status },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(createCustomError(`No user with id: ${userId}`, 404));
  }

  res.status(200).json({
    success: true,
    message: "User status updated successfully",
    user,
  });
});

// Get user statistics (admin/hr only)
const getUserStats = asyncWrapper(async (req, res) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
      },
    },
  ]);

  const statusStats = await User.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const totalUsers = await User.countDocuments();

  res.status(200).json({
    success: true,
    totalUsers,
    roleStats: stats,
    statusStats,
  });
});

export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  resetPassword,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  getUserStats,
};