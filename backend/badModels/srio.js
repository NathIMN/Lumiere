const ClaimSchema = new mongoose.Schema(
  {
    claimId: {
      type: String,
      required: [true, "Claim ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },

    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      ref: "User",
    },

    policy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Policy",
      required: [true, "Policy reference is required"],
    },

    claimType: {
      type: String,
      enum: ["life", "vehicle"],
      required: true,
    },

    // Life insurance coverage
    lifeClaimOption: {
      type: String,
      enum: ["hospitalization", "channelling", "medication", "death"],
      required: function () {
        return this.claimType === "life";
      },
    },

    // Vehicle insurance coverage
    vehicleClaimOption: {
      type: String,
      enum: ["accident", "theft", "fire", "naturalDisaster"],
      required: function () {
        return this.claimType === "vehicle";
      },
    },

    // Link claim-specific Q&A
    qna: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QnA",
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
      default: "pending",
      enum: ["pending", "approved", "rejected", "in-review", "settled"],
    },

    workflow: {
      submittedAt: { type: Date, default: Date.now },
      hrReviewedAt: Date,
      hrReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      forwardedToInsurerAt: Date,
      insurerReviewedAt: Date,
      insurerReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      finalDecisionAt: Date,
      paymentProcessedAt: Date,
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
        timestamp: { type: Date, default: Date.now },
        isRead: { type: Boolean, default: false },
      },
    ],

    priority: {
      type: String,
      default: "normal",
      enum: ["low", "normal", "high", "urgent"],
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Claim", ClaimSchema);
