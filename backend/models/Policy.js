import mongoose from "mongoose";

const PolicySchema = new mongoose.Schema(
  {
    policyId: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
      // Will be auto-generated based on policy type and category
    },
    policyType: {
      type: String,
      required: [true, "Policy type is required"],
      enum: {
        values: ["life", "vehicle"],
        message: "Invalid policy type. Must be either 'life' or 'vehicle'",
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
              // Life policy coverage types
              "hospitalization",
              "surgery",
              "medication",
              "death",
              // Vehicle policy coverage types
              "collision",
              "liability", 
              "comprehensive",
              "personal_accident",
            ],
            validate: {
              validator: function(value) {
                const parent = this.parent().parent();
                const policyType = parent.policyType;
                
                const lifeCoverageTypes = ["hospitalization", "surgery", "medication", "death"];
                const vehicleCoverageTypes = ["collision", "liability", "comprehensive", "personal_accident"];
                
                if (policyType === "life") {
                  return lifeCoverageTypes.includes(value);
                } else if (policyType === "vehicle") {
                  return vehicleCoverageTypes.includes(value);
                }
                return false;
              },
              message: function(props) {
                const parent = this.parent().parent();
                const policyType = parent.policyType;
                if (policyType === "life") {
                  return "Life policy coverage type must be one of: hospitalization, surgery, medication, death";
                } else if (policyType === "vehicle") {
                  return "Vehicle policy coverage type must be one of: collision, liability, comprehensive, personal_accident";
                }
                return "Invalid coverage type for policy";
              }
            }
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

// Auto-generate policyId based on policy type and category
PolicySchema.pre("save", async function (next) {
  if (this.isNew && !this.policyId) {
    try {
      // Determine prefix based on policy type and category
      const typePrefix = this.policyType === "life" ? "L" : "V";
      const categoryPrefix = this.policyCategory === "individual" ? "I" : "G";
      const prefix = typePrefix + categoryPrefix;

      // Find the highest existing policyId for this prefix
      const lastPolicy = await this.constructor
        .findOne({ policyId: new RegExp(`^${prefix}`) })
        .sort({ policyId: -1 })
        .select("policyId");

      let nextNumber = 1;
      if (lastPolicy && lastPolicy.policyId) {
        const currentNumber = parseInt(lastPolicy.policyId.substring(2));
        nextNumber = currentNumber + 1;
      }

      this.policyId = `${prefix}${nextNumber.toString().padStart(4, "0")}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Indexes
PolicySchema.index({ policyId: 1 });
PolicySchema.index({ policyType: 1 });
PolicySchema.index({ policyCategory: 1 });
PolicySchema.index({ beneficiaries: 1 });
PolicySchema.index({ status: 1 });
PolicySchema.index({ "validity.endDate": 1 });
PolicySchema.index({ insuranceAgent: 1 });

const Policy = mongoose.model("Policy", PolicySchema);
export default Policy;