import mongoose from "mongoose";

const PolicySchema = new mongoose.Schema(
  {
    policyNumber: {
      type: String,
      required: [true, "Policy number is required"],
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
      enum: ["individual", "group", "family"],
    },
    insuranceProvider: {
      name: {
        type: String,
        required: [true, "Insurance provider name is required"],
        trim: true,
      },
      agentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Insurance agent is required"],
      },
      contactEmail: {
        type: String,
        required: [true, "Provider contact email is required"],
        lowercase: true,
        trim: true,
      },
      contactPhone: {
        type: String,
        required: [true, "Provider contact phone is required"],
        trim: true,
      },
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
      renewalDate: {
        type: Date,
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
      lastPayment: {
        type: Date,
      },
      nextPayment: {
        type: Date,
      },
    },
    beneficiaries: [
      {
        employeeId: {
          type: String,
          required: true,
          ref: "User",
        },
        relationship: {
          type: String,
          required: true,
          enum: ["self", "spouse", "child", "parent", "sibling", "dependent"],
        },
        percentage: {
          type: Number,
          required: true,
          min: [0, "Percentage cannot be negative"],
          max: [100, "Percentage cannot exceed 100"],
        },
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
PolicySchema.index({ policyNumber: 1 });
PolicySchema.index({ policyType: 1 });
PolicySchema.index({ "beneficiaries.employeeId": 1 });
PolicySchema.index({ status: 1 });
PolicySchema.index({ "validity.endDate": 1 });

const Policy = mongoose.model("Policy", PolicySchema);
export default Policy;
