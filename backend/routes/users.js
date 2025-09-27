import express from "express";
import {
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
} from "../controllers/users.js";
import { authenticate, authorize, authorizeOwnerOrAdmin } from "../middleware/auth.js";

const router = express.Router();

// Authentication routes (public)
router.post("/register", authorize("admin", "hr_officer"), registerUser);
router.post("/login", loginUser);

// User profile routes (protected - user's own data)
router.get("/profile", authenticate, getProfile);
router.patch("/profile", authenticate, updateProfile);
router.patch("/change-password", authenticate, changePassword);

// Admin/HR management routes (protected - admin/hr only)
router.route("/")
  .get(authenticate, authorize("admin", "hr_officer"), getAllUsers)
  .post(authenticate, authorize("admin", "hr_officer"), createUser);

router.route("/:id")
  .get(authenticate, authorize("admin", "hr_officer"), getUserById)
  .patch(authenticate, authorize("admin", "hr_officer"), updateUser)
  .delete(authenticate, authorize("admin"), deleteUser);

// Special purpose routes
router.get("/stats/overview", authenticate, authorize("admin", "hr_officer"), getUserStats);
router.patch("/:id/status", authenticate, authorize("admin", "hr_officer"), updateUserStatus);
router.patch("/:id/reset-password", authenticate, authorize("admin", "hr_officer"), resetPassword);

export default router;