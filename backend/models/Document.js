import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: [true, "Filename is required"],
      trim: true,
      maxlength: [255, "Filename cannot exceed 255 characters"],
    },
    originalName: {
      type: String,
      required: [true, "Original filename is required"],
      trim: true,
      maxlength: [255, "Original filename cannot exceed 255 characters"],
    },
    type: {
      type: String,
      required: [true, "Document type is required"],
      enum: {
        values: ["policy", "claim", "user", "general"],
        message: "Type must be either policy, claim, user, or general",
      },
    },
    docType: {
      type: String,
      required: [true, "Document category is required"],
      enum: {
        values: [
          // General document types
          "nic",
          "passport",
          "invoice",
          "photo",
          "receipt",
          "policy_document",
          "claim_form",
          "supporting_document",
          "supporting",
          "identification",
          "proof_of_policy",
          "other",
          
          // Life insurance specific
          "medical_bill",
          "discharge_summary",
          "prescription",
          "lab_report",
          "channelling_receipt",
          "doctor_report",
          "pharmacy_receipt",
          "medical_report",
          "death_certificate",
          
          // Vehicle insurance specific
          "police_report",
          "damage_assessment",
          "repair_estimate",
          "photos",
          "fir_copy",
          "vehicle_registration",
          "fire_department_report",
          "weather_report",
          
          // Questionnaire related
          "questionnaire_answer"
        ],
        message: "Invalid document category",
      },
    },
    mimeType: {
      type: String,
      required: [true, "MIME type is required"],
      validate: {
        validator: function (v) {
          const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/plain",
            "text/csv",
          ];
          return allowedTypes.includes(v);
        },
        message: "File type not supported",
      },
    },
    size: {
      type: Number,
      required: [true, "File size is required"],
      min: [1, "File size must be greater than 0"],
      max: [10 * 1024 * 1024, "File size cannot exceed 10MB"],
    },
    azureBlobUrl: {
      type: String,
      required: [true, "Azure blob URL is required"],
      trim: true,
    },
    azureContainerName: {
      type: String,
      required: [true, "Azure container name is required"],
      trim: true,
    },
    userId: {
      type: String,
      trim: true,
      default: null,
      // Will be populated when user authentication is implemented
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      // Reference to related claim, policy, or user document
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "Uploader information is required"],
    },
    uploadedByRole: {
      type: String,
      required: [true, "Uploader role is required"],
      enum: {
        values: ["employee", "hr_officer", "insurance_agent", "admin"],
        message: "Invalid uploader role",
      },
    },
    status: {
      type: String,
      default: "active",
      enum: {
        values: ["active", "archived", "deleted"],
        message: "Status must be active, archived, or deleted",
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    metadata: {
      description: {
        type: String,
        maxlength: [500, "Description cannot exceed 500 characters"],
        trim: true,
      },
      tags: [
        {
          type: String,
          trim: true,
          maxlength: [50, "Tag cannot exceed 50 characters"],
        },
      ],
      version: {
        type: Number,
        default: 1,
        min: [1, "Version must be at least 1"],
      },
      isConfidential: {
        type: Boolean,
        default: false,
      },
      expiryDate: {
        type: Date,
        default: null,
      },
      documentNumber: {
        type: String,
        trim: true,
        default: null,
      },
    },
    accessLog: [
      {
        accessedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        accessedByRole: {
          type: String,
          required: true,
          enum: ["employee", "hr_officer", "insurance_agent", "admin"],
        },
        accessedAt: {
          type: Date,
          default: Date.now,
        },
        action: {
          type: String,
          required: true,
          enum: ["view", "download", "update", "delete", "ocr_extract"],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

DocumentSchema.index({ type: 1, docType: 1 });
DocumentSchema.index({ userId: 1 });
DocumentSchema.index({ refId: 1 });
DocumentSchema.index({ uploadedBy: 1 });
DocumentSchema.index({ createdAt: -1 });
DocumentSchema.index({ status: 1 });

// Virtual for file size in human readable format
DocumentSchema.virtual("fileSizeFormatted").get(function () {
  const bytes = this.size;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
});

// Instance method to log access
DocumentSchema.methods.logAccess = function (accessedBy, role, action) {
  this.accessLog.push({
    accessedBy: mongoose.Types.ObjectId.isValid(accessedBy) ? accessedBy : new mongoose.Types.ObjectId(accessedBy),
    accessedByRole: role,
    action,
  });
  return this.save();
};

// Instance method to verify document
DocumentSchema.methods.verify = function (verifiedBy) {
  this.isVerified = true;
  this.verifiedBy = mongoose.Types.ObjectId.isValid(verifiedBy) ? verifiedBy : new mongoose.Types.ObjectId(verifiedBy);
  this.verifiedAt = new Date();
  return this.save();
};

// Static method to find documents by type and reference
DocumentSchema.statics.findByReference = function (type, refId) {
  return this.find({ type, refId, status: "active" });
};

// Static method to find user documents
DocumentSchema.statics.findByUser = function (userId) {
  const userObjectId = mongoose.Types.ObjectId.isValid(userId) ? userId : new mongoose.Types.ObjectId(userId);
  return this.find({ userId: userObjectId, status: "active" }).sort({ createdAt: -1 });
};

// Static method to find documents by uploader
DocumentSchema.statics.findByUploader = function (uploaderId) {
  const uploaderObjectId = mongoose.Types.ObjectId.isValid(uploaderId) ? uploaderId : new mongoose.Types.ObjectId(uploaderId);
  return this.find({ uploadedBy: uploaderObjectId, status: "active" }).sort({ createdAt: -1 });
};

// Pre-save middleware to generate document number if not provided
DocumentSchema.pre("save", function (next) {
  if (this.isNew && !this.metadata.documentNumber) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.metadata.documentNumber =
      `DOC-${this.type.toUpperCase()}-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

const Document = mongoose.model("Document", DocumentSchema);
export default Document;
