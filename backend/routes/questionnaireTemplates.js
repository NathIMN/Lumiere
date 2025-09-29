import express from "express";
import {
  getValidCombinations,
  getAllTemplates,
  getTemplateById,
  getTemplateByTypeAndOption,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  hardDeleteTemplate,
  toggleTemplateStatus,
  cloneTemplate,
  getMissingCombinations,
  validateTemplate
} from "../controllers/questionnaireTemplates.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// Information routes (accessible to authenticated users)
router.get("/combinations/valid", authenticate, getValidCombinations);
router.get("/combinations/missing", 
  authenticate, 
  authorize("admin", "hr_officer"), 
  getMissingCombinations
);

// Template validation route
router.post("/validate", 
  authenticate, 
  authorize("admin", "hr_officer"), 
  validateTemplate
);

// Get template by claim type and option (for loading questionnaires)
router.get("/by-type/:claimType/:claimOption", 
  authenticate, 
  getTemplateByTypeAndOption
);

// Main CRUD routes
router.route("/")
  .get(authenticate, getAllTemplates)
  .post(authenticate, authorize("admin", "agent", "insurance_agent"), createTemplate);

router.route("/:id")
  .get(authenticate, getTemplateById)
  .patch(authenticate, authorize("admin", "agent", "insurance_agent", "hr_officer"), updateTemplate)
  .delete(authenticate, authorize("admin", "agent", "insurance_agent", "hr_officer"), deleteTemplate);

// Special template management routes (admin/hr only)
router.post("/:id/clone", 
  authenticate, 
  authorize("admin", "hr_officer"), 
  cloneTemplate
);

router.patch("/:id/toggle-status", 
  authenticate, 
  authorize("admin", "agent", "insurance_agent", "hr_officer"), 
  toggleTemplateStatus
);

router.delete("/:id/hard-delete", 
  authenticate, 
  authorize("admin"), 
  hardDeleteTemplate
);

export default router;