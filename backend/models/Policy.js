import mongoose from "mongoose";

const PolicySchema = new mongoose.Schema(
  {
    policyId: {
      type: String,
      required: [true, "Policy ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    policyType: {
      type: String,
      required: [true, "Policy type is required"],
      enum: {
        values: ["life", "medical", "vehicle", "travel", "property"],
        message: "Invalid policy type",
      },
    },
    policyCategory: {
      type: String,
      required: [true, "Policy category is required"],
      enum: ["individual", "group"],
    },
    insuranceAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Insurance agent is required"],
    },
    coverage: {
      coverageAmount: {
        type: Number,
        required: [true, "Coverage amount is required"],
        min: [0, "Coverage amount cannot be negative"],
      },
      deductible: {
        type: Number,
        default: 0,
        min: [0, "Deductible cannot be negative"],
      },
      coverageDetails: [
        {
          type: {
            type: String,
            required: true,
            enum: [
              "hospitalization",
              "surgery",
              "medication",
              "dental",
              "optical",
              "maternity",
              "accident",
              "death",
              "disability",
              "other",
            ],
          },
          description: {
            type: String,
            required: true,
            trim: true,
          },
          limit: {
            type: Number,
            required: true,
            min: 0,
          },
          used: {
            type: Number,
            default: 0,
            min: 0,
          },
        },
      ],
    },
    validity: {
      startDate: {
        type: Date,
        required: [true, "Policy start date is required"],
      },
      endDate: {
        type: Date,
        required: [true, "Policy end date is required"],
        validate: {
          validator: function (v) {
            return v > this.validity.startDate;
          },
          message: "End date must be after start date",
        },
      },
    },
    premium: {
      amount: {
        type: Number,
        required: [true, "Premium amount is required"],
        min: [0, "Premium amount cannot be negative"],
      },
      frequency: {
        type: String,
        required: [true, "Premium frequency is required"],
        enum: ["monthly", "quarterly", "semi-annual", "annual"],
      },
    },
    beneficiaries: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    status: {
      type: String,
      default: "active",
      enum: ["active", "expired", "cancelled", "suspended", "pending"],
    },
    documents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
      },
    ],
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
PolicySchema.index({ policyId: 1 });
PolicySchema.index({ policyType: 1 });
PolicySchema.index({ beneficiaries: 1 });
PolicySchema.index({ status: 1 });
PolicySchema.index({ "validity.endDate": 1 });
PolicySchema.index({ insuranceAgent: 1 });

const Policy = mongoose.model("Policy", PolicySchema);
export default Policy;