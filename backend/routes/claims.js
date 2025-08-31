import express from "express";
import {
  createClaim,
  updateQuestionnaireAnswer,
  submitClaim,
  forwardToInsurer,
  makeDecision,
  returnClaim,
  getAllClaims,
  getClaimById,
  getClaimsRequiringAction,
  getClaimStatistics,
  getQuestionnaireQuestions,
  submitQuestionnaireAnswers,
} from "../controllers/claims.js";
import { authenticate, authorize } from "../middleware/auth.js";

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
  .get(authenticate, getClaimById);

// Employee actions (questionnaire and submission)
router.get("/:id/questionnaire",
  authenticate,
  authorize("employee", "admin", "hr_officer"),
  getQuestionnaireQuestions
);

router.patch("/:id/questionnaire/answer",
  authenticate,
  authorize("employee", "admin", "hr_officer"),
  updateQuestionnaireAnswer
);

router.patch("/:id/questionnaire/submit-answers",
  authenticate,
  authorize("employee", "admin", "hr_officer"),
  submitQuestionnaireAnswers
);

router.patch("/:id/submit",
  authenticate,
  authorize("employee", "admin", "hr_officer"),
  submitClaim
);

// HR actions (forward to insurer)
router.patch("/:id/forward",
  authenticate,
  authorize("hr_officer", "admin"),
  forwardToInsurer
);

// Insurance agent actions (final decision)
router.patch("/:id/decision",
  authenticate,
  authorize("insurance_agent", "admin"),
  makeDecision
);

// Return claim to previous stage (HR or Insurance agent)
router.patch("/:id/return",
  authenticate,
  authorize("hr_officer", "insurance_agent", "admin"),
  returnClaim
);

export default router;