import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
  filename: { type: String, required: [true, "Filename is required"], trim: true, maxlength: [255, "Filename cannot exceed 255 characters"] },
  originalName: { type: String, required: [true, "Original filename is required"], trim: true, maxlength: [255, "Original filename cannot exceed 255 characters"] },
  type: { type: String, required: [true, "Document type is required"], enum: { values: ["policy", "claim", "user", "general"], message: "Type must be either policy, claim, user, or general" } },
  docType: { type: String, required: [true, "Document category is required"], enum: { values: ["nic", "passport", "invoice", "medical_bill", "police_report", "photo", "receipt", "policy_document", "claim_form", "supporting_document", "other"], message: "Invalid document category" } },
  mimeType: { type: String, required: [true, "MIME type is required"], validate: { validator: function (v) { const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/plain", "text/csv"]; return allowedTypes.includes(v); }, message: "File type not supported" } },
  size: { type: Number, required: [true, "File size is required"], min: [1, "File size must be greater than 0"], max: [10 * 1024 * 1024, "File size cannot exceed 10MB"] },
  azureBlobUrl: { type: String, required: [true, "Azure blob URL is required"], trim: true },
  azureContainerName: { type: String, required: [true, "Azure container name is required"], trim: true },
  userId: { type: String, trim: true, default: null }, // Will be populated when user authentication is implemented
  refId: { type: mongoose.Schema.Types.ObjectId, default: null }, // Reference to related claim, policy, or user document
  uploadedBy: { type: String, required: [true, "Uploader information is required"], trim: true },
  uploadedByRole: { type: String, required: [true, "Uploader role is required"], enum: { values: ["employee", "hr_officer", "insurance_agent", "admin"], message: "Invalid uploader role" } },
  status: { type: String, default: "active", enum: { values: ["active", "archived", "deleted"], message: "Status must be active, archived, or deleted" } },
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: String, trim: true, default: null },
  verifiedAt: { type: Date, default: null },
  metadata: {
    description: { type: String, maxlength: [500, "Description cannot exceed 500 characters"], trim: true },
    tags: [{ type: String, trim: true, maxlength: [50, "Tag cannot exceed 50 characters"] }],
    version: { type: Number, default: 1, min: [1, "Version must be at least 1"] },
    isConfidential: { type: Boolean, default: false },
    expiryDate: { type: Date, default: null },
    documentNumber: { type: String, trim: true, default: null }
  },
  accessLog: [{
    accessedBy: { type: String, required: true },
    accessedByRole: { type: String, required: true, enum: ["employee", "hr_officer", "insurance_agent", "admin"] },
    accessedAt: { type: Date, default: Date.now },
    action: { type: String, required: true, enum: ["view", "download", "update", "delete"] }
  }]
}, { timestamps: true });

DocumentSchema.index({ type: 1, docType: 1 });
DocumentSchema.index({ userId: 1 });
DocumentSchema.index({ refId: 1 });
DocumentSchema.index({ uploadedBy: 1 });
DocumentSchema.index({ createdAt: -1 });
DocumentSchema.index({ status: 1 });

const Document = mongoose.model("Document", DocumentSchema);
export default Document;