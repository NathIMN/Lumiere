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
   submitSectionAnswers,  // New method
   getSectionQuestions,   // New method
   updateClaimStatus,
   deleteClaimById,
   uploadClaimDocument
} from "../controllers/claims.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

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

// Get specific section questions
router.get("/:id/questionnaire/section/:sectionId",
   authenticate,
   authorize("employee", "admin", "hr_officer"),
   getSectionQuestions
);

// Update single answer (backward compatibility) - now supports file uploads
router.patch("/:id/questionnaire/answer",
   authenticate,
   authorize("employee", "admin", "hr_officer"),
   upload.single('answerFile'),
   updateQuestionnaireAnswer
);

// Submit answers for a specific section (NEW)
router.patch("/:id/questionnaire/section/:sectionId/submit-answers",
   authenticate,
   authorize("employee", "admin", "hr_officer"),
   submitSectionAnswers
);

// Submit all questionnaire answers at once (updated to work with sections)
router.patch("/:id/questionnaire/submit-answers",
   authenticate,
   authorize("employee", "admin", "hr_officer"),
   submitQuestionnaireAnswers
);

// Submit claim with optional file uploads
router.patch("/:id/submit",
   authenticate,
   authorize("employee", "admin", "hr_officer"),
   upload.array('documents', 10), // Allow up to 10 files
   submitClaim
);

// Upload documents for a claim
router.post("/:id/documents",
   authenticate,
   authorize("employee", "admin", "hr_officer"),
   upload.single('document'),
   uploadClaimDocument
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

// Update claim status 
router.patch("/:id/status",
   authenticate,
   authorize("employee", "admin", "hr_officer"),
   updateClaimStatus
);

router.delete("/by-id/:id",
   authenticate,
   authorize("employee"),
   deleteClaimById
);


export default router;