import express from "express";
import {
  createClaim,
  loadQuestionnaire,
  updateQuestionnaireAnswer,
  setClaimAmount,
  submitClaim,
  getAllClaims,
  getClaimById,
  getClaimsRequiringAction,
  updateClaimStatus,
  addClaimNote,
  getClaimStatistics
} from "../controllers/claims.js";
import { authenticate, authorize, authorizeOwnerOrRole } from "../middleware/auth.js";

const router = express.Router();

// Statistics route (must come before parameterized routes)
router.get("/stats/overview", authenticate, getClaimStatistics);

// Claims requiring action (dashboard route)
router.get("/actions/pending", authenticate, getClaimsRequiringAction);

// Main CRUD routes
router.route("/")
  .get(authenticate, getAllClaims)
  .post(authenticate, authorize("employee", "admin", "hr_officer"), createClaim);

router.route("/:id")
  .get(authenticate, getClaimById)
  .patch(authenticate, authorize("admin", "hr_officer", "insurance_agent"), updateClaimStatus);

// Claim lifecycle management routes
router.patch("/:id/load-questionnaire", 
  (req, res, next) => {
    console.log("Route hit: /load-questionnaire");
    console.log("Method:", req.method);
    console.log("Params:", req.params);
    next();
  },
  authenticate, 
  authorize("employee", "admin", "hr_officer"), 
  loadQuestionnaire
);

router.patch("/:id/questionnaire/answer", 
  authenticate, 
  authorize("employee", "admin", "hr_officer"), 
  updateQuestionnaireAnswer
);

router.patch("/:id/set-amount", 
  authenticate, 
  authorize("employee", "admin", "hr_officer"), 
  setClaimAmount
);

router.patch("/:id/submit", 
  authenticate, 
  authorize("employee", "admin", "hr_officer"), 
  submitClaim
);

// Notes management
router.post("/:id/notes", authenticate, addClaimNote);

export default router;