import express from "express";
import {
  createPolicy,
  getAllPolicies,
  getPolicyById,
  getPolicyByPolicyId,
  updatePolicy,
  deletePolicy,
  updatePolicyStatus,
  addBeneficiary,
  removeBeneficiary,
  getUserPolicies,
  getAgentPolicies,
  getPolicyStats,
  getExpiringPolicies,
  renewPolicy,
  checkPolicyEligibility,
  getPolicyUsage,
  bulkUpdateStatus,
  getPoliciesByAgent,
  getBeneficiaryClaimedAmounts,
  getPolicyClaimedAmountsSummary,
  validatePolicyCoverageConsistency,
  getEnhancedClaimedAmountsSummary,
} from "../controllers/policies.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// User-specific policy routes (must come before parameterized routes)
router.get("/my-policies", authenticate, getUserPolicies); // Any authenticated user
router.get("/my-agent-policies", authenticate, authorize("insurance_agent"), getAgentPolicies);

// Policy analytics and reporting routes
router.get("/stats/overview", authenticate, authorize("admin", "hr_officer"), getPolicyStats);
router.get("/stats/expiring", authenticate, authorize("admin", "hr_officer"), getExpiringPolicies);

// Policy eligibility check for users
router.get("/eligibility/:policyType", authenticate, checkPolicyEligibility);

// Agent-specific routes
router.get("/agent/:agentId", authenticate, authorize("admin", "hr_officer"), getPoliciesByAgent);

// Bulk operations (admin only)
router.patch("/bulk/status", authenticate, authorize("admin"), bulkUpdateStatus); // Admin only

// Policy CRUD routes
router.route("/")
  .get(authenticate, authorize("admin", "hr_officer"), getAllPolicies)
  .post(authenticate, authorize("admin"), createPolicy); // Admin only

// Get policy by custom policy ID (e.g., LG0001)
router.get("/policy-id/:policyId", authenticate, authorize("admin", "hr_officer", "insurance_agent"), getPolicyByPolicyId);

// Policy management routes (admin only for destructive operations)
router.route("/:id")
  .get(authenticate, authorize("admin", "hr_officer", "insurance_agent"), getPolicyById)
  .patch(authenticate, authorize("admin"), updatePolicy) // Admin only
  .delete(authenticate, authorize("admin"), deletePolicy); // Admin only

// Policy status and renewal routes
router.patch("/:id/status", authenticate, authorize("admin", "hr_officer"), updatePolicyStatus);
router.patch("/:id/renew", authenticate, authorize("admin"), renewPolicy); // Admin only

// Beneficiary management routes
router.patch("/:id/beneficiaries/add", authenticate, authorize("admin", "hr_officer"), addBeneficiary);
router.patch("/:id/beneficiaries/remove", authenticate, authorize("admin", "hr_officer"), removeBeneficiary);

// Claimed amounts tracking routes
router.get("/:id/claimed-amounts", authenticate, getBeneficiaryClaimedAmounts); // Employees can check their own, admin/hr/agent can check any
router.get("/:id/claimed-amounts/summary", authenticate, authorize("admin", "hr_officer", "insurance_agent"), getPolicyClaimedAmountsSummary);
router.get("/:id/enhanced-claimed-amounts-summary", authenticate, authorize("admin", "hr_officer", "insurance_agent"), getEnhancedClaimedAmountsSummary);

// Coverage validation routes
router.get("/:id/validate-coverage-consistency", authenticate, authorize("admin", "hr_officer", "insurance_agent"), validatePolicyCoverageConsistency);

// Policy usage (must come after other specific routes)
router.get("/:id/usage", authenticate, authorize("admin", "hr_officer"), getPolicyUsage);

export default router;