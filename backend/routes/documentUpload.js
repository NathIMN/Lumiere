import express from "express";
import upload from "../middleware/upload.js";
import {
  uploadDocument,
  uploadMultipleDocuments,
  downloadDocument,
  deleteDocumentFile
} from "../controllers/documentUpload.js";

const router = express.Router();

// Upload routes
router.post("/upload", upload.single('document'), uploadDocument);
router.post("/upload/multiple", upload.array('documents', 10), uploadMultipleDocuments);

// Download and delete routes
router.get("/:id/download", downloadDocument);
router.delete("/:id/delete", deleteDocumentFile);

export default router;