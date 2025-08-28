import mongoose from "mongoose";

const ClaimSchema = new mongoose.Schema(
  {
    claimNumber: {
      type: String,
      required: [true, "Claim number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      ref: "User",
    },
    policyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Policy ID is required"],
      ref: "Policy",
    },
    claimType: {
      type: String,
      required: [true, "Claim type is required"],
      enum: ["medical", "life", "vehicle", "travel", "property", "disability"],
    },
    incident: {
      date: {
        type: Date,
        required: [true, "Incident date is required"],
        validate: {
          validator: function (v) {
            return v <= new Date();
          },
          message: "Incident date cannot be in the future",
        },
      },
      location: {
        type: String,
        required: [true, "Incident location is required"],
        trim: true,
        maxlength: [200, "Location cannot exceed 200 characters"],
      },
      description: {
        type: String,
        required: [true, "Incident description is required"],
        trim: true,
        maxlength: [1000, "Description cannot exceed 1000 characters"],
      },
      cause: {
        type: String,
        required: [true, "Incident cause is required"],
        enum: [
          "accident",
          "illness",
          "natural_disaster",
          "theft",
          "damage",
          "death",
          "other",
        ],
      },
      witnessDetails: {
        name: { type: String, trim: true },
        contact: { type: String, trim: true },
      },
    },
    claimAmount: {
      requested: {
        type: Number,
        required: [true, "Requested claim amount is required"],
        min: [0, "Claim amount cannot be negative"],
      },
      approved: {
        type: Number,
        default: 0,
        min: [0, "Approved amount cannot be negative"],
      },
      deductible: {
        type: Number,
        default: 0,
        min: [0, "Deductible cannot be negative"],
      },
      finalAmount: {
        type: Number,
        default: 0,
        min: [0, "Final amount cannot be negative"],
      },
    },
    status: {
      type: String,
      default: "submitted",
      enum: {
        values: [
          "draft",
          "submitted",
          "under_review",
          "hr_approved",
          "forwarded_to_insurer",
          "insurer_reviewing",
          "approved",
          "rejected",
          "partially_approved",
          "paid",
          "closed",
        ],
        message: "Invalid claim status",
      },
    },
    workflow: {
      submittedAt: {
        type: Date,
        default: Date.now,
      },
      hrReviewedAt: {
        type: Date,
      },
      hrReviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      forwardedToInsurerAt: {
        type: Date,
      },
      insurerReviewedAt: {
        type: Date,
      },
      insurerReviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      finalDecisionAt: {
        type: Date,
      },
      paymentProcessedAt: {
        type: Date,
      },
    },
    documents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
        required: true,
      },
    ],
    communication: [
      {
        from: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        to: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        message: {
          type: String,
          required: true,
          trim: true,
          maxlength: [1000, "Message cannot exceed 1000 characters"],
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        isRead: {
          type: Boolean,
          default: false,
        },
      },
    ],
    notes: [
      {
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        note: {
          type: String,
          required: true,
          trim: true,
          maxlength: [500, "Note cannot exceed 500 characters"],
        },
        isInternal: {
          type: Boolean,
          default: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, "Rejection reason cannot exceed 500 characters"],
    },
    paymentDetails: {
      method: {
        type: String,
        enum: ["bank_transfer", "cheque", "cash", "digital_wallet"],
      },
      accountNumber: {
        type: String,
        trim: true,
      },
      bankName: {
        type: String,
        trim: true,
      },
      transactionId: {
        type: String,
        trim: true,
      },
      processedAt: {
        type: Date,
      },
    },
    priority: {
      type: String,
      default: "normal",
      enum: ["low", "normal", "high", "urgent"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ClaimSchema.index({ claimNumber: 1 });
ClaimSchema.index({ employeeId: 1 });
ClaimSchema.index({ policyId: 1 });
ClaimSchema.index({ status: 1 });
ClaimSchema.index({ claimType: 1 });
ClaimSchema.index({ "incident.date": -1 });
ClaimSchema.index({ createdAt: -1 });

// Pre-save middleware to generate claim number
ClaimSchema.pre("save", function (next) {
  if (this.isNew && !this.claimNumber) {
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    this.claimNumber = `CLM-${year}${month}-${random}`;
  }
  next();
});

const Claim = mongoose.model("Claim", ClaimSchema);
export default Claim;
