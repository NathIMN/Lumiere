import express from "express";
import {
  getAllDocuments,
  createDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  getDocumentsByReference,
  getUserDocuments,
  verifyDocument,
  getDocumentStats,
  archiveDocument,
} from "../controllers/documents.js";

const router = express.Router();

// Basic routes
router.route("/").get(getAllDocuments).post(createDocument);

router
  .route("/:id")
  .get(getDocument)
  .patch(updateDocument)
  .delete(deleteDocument);

// Special purpose routes
router.get("/stats/overview", getDocumentStats);
router.get("/reference/:type/:refId", getDocumentsByReference);
router.get("/user/:userId", getUserDocuments);
router.patch("/:id/verify", verifyDocument);
router.patch("/:id/archive", archiveDocument);

export default router;
