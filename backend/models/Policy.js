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
      // Life policy coverage types
      typeLife: [
        {
          type: String,
          enum: ["life_cover", "hospitalization", "surgical_benefits", "outpatient", "prescription_drugs"],
        }
      ],
      // Vehicle policy coverage types
      typeVehicle: [
        {
          type: String,
          enum: ["collision", "liability", "comprehensive", "personal_accident"],
        }
      ],
      coverageDetails: [
        {
          type: {
            type: String,
            required: true,
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
            // During updates, this.validity might not be fully populated
            // So we need to check if startDate is available before validating
            if (this.validity && this.validity.startDate) {
              return v > this.validity.startDate;
            }
            // If we can't access startDate (during updates), skip this validation
            // The application logic should ensure proper date validation
            return true;
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
        //required: true,
      },
    ],
    // Track claimed amounts per beneficiary per coverage type
    // Array mirrors beneficiaries array - same index positions
    claimedAmounts: [
      [
        {
          coverageType: {
            type: String,
            required: true,
          },
          claimedAmount: {
            type: Number,
            default: 0,
            min: [0, "Claimed amount cannot be negative"],
          },
        }
      ]
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

// Helper methods for claimed amounts management
PolicySchema.methods.initializeClaimedAmountsForBeneficiary = function(beneficiaryIndex) {
  // Initialize claimed amounts for a new beneficiary based on coverage types
  const coverageTypes = this.policyType === 'life' ? this.coverage.typeLife : this.coverage.typeVehicle;
  const initialClaimedAmounts = coverageTypes.map(type => ({
    coverageType: type,
    claimedAmount: 0
  }));
  
  // If claimedAmounts array doesn't exist, initialize it
  if (!this.claimedAmounts) {
    this.claimedAmounts = [];
  }
  
  // Insert at the specific index
  this.claimedAmounts.splice(beneficiaryIndex, 0, initialClaimedAmounts);
};

PolicySchema.methods.removeClaimedAmountsForBeneficiary = function(beneficiaryIndex) {
  // Remove claimed amounts for a beneficiary at specific index
  if (this.claimedAmounts && this.claimedAmounts.length > beneficiaryIndex) {
    this.claimedAmounts.splice(beneficiaryIndex, 1);
  }
};

PolicySchema.methods.getClaimedAmountForBeneficiary = function(beneficiaryId, coverageType) {
  // Find beneficiary index - handle both populated User objects and ObjectIds
  const beneficiaryIndex = this.beneficiaries.findIndex(
    beneficiary => {
      const currentId = beneficiary._id ? beneficiary._id.toString() : beneficiary.toString();
      return currentId === beneficiaryId.toString();
    }
  );
  
  if (beneficiaryIndex === -1) {
    throw new Error('Beneficiary not found in policy');
  }
  
  // Get claimed amounts for this beneficiary
  if (!this.claimedAmounts || !this.claimedAmounts[beneficiaryIndex]) {
    return 0;
  }
  
  const coverageClaimed = this.claimedAmounts[beneficiaryIndex].find(
    c => c.coverageType === coverageType
  );
  
  return coverageClaimed ? coverageClaimed.claimedAmount : 0;
};

PolicySchema.methods.addClaimedAmount = function(beneficiaryId, coverageType, amount) {
  // Find beneficiary index - handle both populated User objects and ObjectIds
  const beneficiaryIndex = this.beneficiaries.findIndex(
    beneficiary => {
      const currentId = beneficiary._id ? beneficiary._id.toString() : beneficiary.toString();
      return currentId === beneficiaryId.toString();
    }
  );
  
  if (beneficiaryIndex === -1) {
    throw new Error('Beneficiary not found in policy');
  }
  
  // Initialize claimedAmounts if not exists
  if (!this.claimedAmounts) {
    this.claimedAmounts = [];
  }
  
  // Initialize for this beneficiary if not exists
  if (!this.claimedAmounts[beneficiaryIndex]) {
    this.initializeClaimedAmountsForBeneficiary(beneficiaryIndex);
  }
  
  // Find and update the coverage type
  const coverageClaimed = this.claimedAmounts[beneficiaryIndex].find(
    c => c.coverageType === coverageType
  );
  
  if (coverageClaimed) {
    coverageClaimed.claimedAmount += amount;
  } else {
    // Add new coverage type if not exists
    this.claimedAmounts[beneficiaryIndex].push({
      coverageType: coverageType,
      claimedAmount: amount
    });
  }
};

PolicySchema.methods.getCoverageLimit = function(coverageType) {
  // Get the limit for a specific coverage type
  const coverageDetail = this.coverage.coverageDetails.find(
    detail => detail.type === coverageType
  );
  return coverageDetail ? coverageDetail.limit : 0;
};

PolicySchema.methods.getRemainingCoverage = function(beneficiaryId, coverageType) {
  // Calculate remaining coverage for a beneficiary for a specific coverage type
  const limit = this.getCoverageLimit(coverageType);
  const claimed = this.getClaimedAmountForBeneficiary(beneficiaryId, coverageType);
  return Math.max(0, limit - claimed);
};

PolicySchema.methods.validateClaimAmount = function(beneficiaryId, coverageType, requestedAmount) {
  // Validate if a claim amount is within limits
  const remaining = this.getRemainingCoverage(beneficiaryId, coverageType);
  return requestedAmount <= remaining;
};

// New methods for total coverage amount calculation and validation
PolicySchema.methods.calculateTotalCoverageAmount = function() {
  // Auto-calculate total coverage amount from coverageDetails
  if (!this.coverage.coverageDetails || this.coverage.coverageDetails.length === 0) {
    return this.coverage.coverageAmount || 0; // Return existing amount if no details
  }
  
  return this.coverage.coverageDetails.reduce((total, detail) => {
    return total + (detail.limit || 0);
  }, 0);
};

PolicySchema.methods.syncCoverageAmount = function() {
  // Sync coverageAmount with sum of coverageDetails
  const calculatedAmount = this.calculateTotalCoverageAmount();
  if (calculatedAmount > 0) {
    this.coverage.coverageAmount = calculatedAmount;
  }
  return this.coverage.coverageAmount;
};

PolicySchema.methods.validateCoverageConsistency = function() {
  // Validate that coverageAmount matches sum of coverageDetails
  const calculatedAmount = this.calculateTotalCoverageAmount();
  const currentAmount = this.coverage.coverageAmount;
  
  return {
    isConsistent: Math.abs(calculatedAmount - currentAmount) < 0.01, // Allow for floating point precision
    calculatedAmount,
    currentAmount,
    difference: calculatedAmount - currentAmount
  };
};

PolicySchema.methods.getTotalClaimedForBeneficiary = function(beneficiaryId) {
  // Calculate total claimed across all coverage types for a beneficiary
  const beneficiaryIndex = this.beneficiaries.findIndex(
    beneficiary => {
      const currentId = beneficiary._id ? beneficiary._id.toString() : beneficiary.toString();
      return currentId === beneficiaryId.toString();
    }
  );
  
  if (beneficiaryIndex === -1 || !this.claimedAmounts[beneficiaryIndex]) {
    return 0;
  }
  
  return this.claimedAmounts[beneficiaryIndex].reduce(
    (total, coverage) => total + coverage.claimedAmount, 0
  );
};

PolicySchema.methods.getRemainingTotalCoverage = function(beneficiaryId) {
  // Get remaining total coverage for beneficiary
  const claimed = this.getTotalClaimedForBeneficiary(beneficiaryId);
  return Math.max(0, this.coverage.coverageAmount - claimed);
};

PolicySchema.methods.validateTotalClaimAmount = function(beneficiaryId, additionalAmount) {
  // Validate if additional claim would exceed total coverage limit
  const currentTotal = this.getTotalClaimedForBeneficiary(beneficiaryId);
  const totalAfterClaim = currentTotal + additionalAmount;
  return totalAfterClaim <= this.coverage.coverageAmount;
};

// Auto-initialize all coverage types for consistent policy structure
PolicySchema.methods.initializeAllCoverageTypes = function() {
  const allLifeCoverageTypes = ["life_cover", "hospitalization", "surgical_benefits", "outpatient", "prescription_drugs"];
  const allVehicleCoverageTypes = ["collision", "liability", "comprehensive", "personal_accident"];
  
  if (this.policyType === 'life') {
    // Ensure typeLife includes all coverage types
    this.coverage.typeLife = allLifeCoverageTypes;
    
    // Initialize coverageDetails with all types if not exists
    allLifeCoverageTypes.forEach(type => {
      const existingDetail = this.coverage.coverageDetails.find(detail => detail.type === type);
      if (!existingDetail) {
        this.coverage.coverageDetails.push({
          type: type,
          description: this.getDefaultDescription(type),
          limit: 0 // Default to 0, can be updated later
        });
      }
    });
  } else if (this.policyType === 'vehicle') {
    // Ensure typeVehicle includes all coverage types
    this.coverage.typeVehicle = allVehicleCoverageTypes;
    
    // Initialize coverageDetails with all types if not exists
    allVehicleCoverageTypes.forEach(type => {
      const existingDetail = this.coverage.coverageDetails.find(detail => detail.type === type);
      if (!existingDetail) {
        this.coverage.coverageDetails.push({
          type: type,
          description: this.getDefaultDescription(type),
          limit: 0 // Default to 0, can be updated later
        });
      }
    });
  }
};

// Get default descriptions for coverage types
PolicySchema.methods.getDefaultDescription = function(coverageType) {
  const descriptions = {
    // Life insurance coverage types
    "life_cover": "Life insurance and death benefits",
    "hospitalization": "Hospital stays and medical treatments",
    "surgical_benefits": "Surgical procedures and related costs", 
    "outpatient": "Outpatient treatments and consultations",
    "prescription_drugs": "Prescription medications and pharmacy costs",
    
    // Vehicle insurance coverage types
    "collision": "Collision damage and repairs",
    "liability": "Third-party liability coverage",
    "comprehensive": "Comprehensive vehicle protection",
    "personal_accident": "Personal accident and injury coverage"
  };
  return descriptions[coverageType] || `${coverageType.replace('_', ' ')} coverage`;
};

// Pre-save middleware to auto-sync coverageAmount and initialize claimedAmounts
PolicySchema.pre("save", function (next) {
  // Auto-initialize all coverage types for new policies (both life and vehicle)
  if (this.isNew) {
    this.initializeAllCoverageTypes();
  }
  
  // Auto-calculate coverageAmount if coverageDetails are modified or new policy
  if (this.isModified('coverage.coverageDetails') || this.isNew) {
    const calculatedAmount = this.calculateTotalCoverageAmount();
    
    // Only update if we have coverage details and calculated amount is greater than 0
    if (this.coverage.coverageDetails && this.coverage.coverageDetails.length > 0 && calculatedAmount > 0) {
      // For new policies, always use calculated amount
      // For existing policies, only update if coverageAmount wasn't manually set
      if (this.isNew || !this.coverage.coverageAmount || this.coverage.coverageAmount === 0) {
        this.coverage.coverageAmount = calculatedAmount;
      }
    }
  }
  
  // Initialize claimedAmounts when beneficiaries are added/modified
  if (this.isModified('beneficiaries')) {
    // Initialize claimedAmounts if it doesn't exist
    if (!this.claimedAmounts) {
      this.claimedAmounts = [];
    }
    
    // Ensure claimedAmounts array has same length as beneficiaries
    const beneficiaryCount = this.beneficiaries.length;
    const claimedAmountsCount = this.claimedAmounts.length;
    
    if (beneficiaryCount > claimedAmountsCount) {
      // New beneficiaries added - initialize claimed amounts for them
      // Use actual coverage types from typeLife array (which now includes all 4 for life policies)
      const coverageTypes = this.policyType === 'life' ? this.coverage.typeLife : this.coverage.typeVehicle;
      
      for (let i = claimedAmountsCount; i < beneficiaryCount; i++) {
        const initialClaimedAmounts = coverageTypes.map(type => ({
          coverageType: type,
          claimedAmount: 0
        }));
        this.claimedAmounts.push(initialClaimedAmounts);
      }
    } else if (beneficiaryCount < claimedAmountsCount) {
      // Beneficiaries removed - trim claimedAmounts array
      this.claimedAmounts = this.claimedAmounts.slice(0, beneficiaryCount);
    }
  }
  next();
});

// Validation middleware to ensure correct coverage types based on policy type
PolicySchema.pre("save", function (next) {
  if (this.policyType === "life") {
    // For life policies, typeLife is required and typeVehicle should be empty
    if (!this.coverage.typeLife || this.coverage.typeLife.length === 0) {
      return next(new Error("Life policy must have at least one life coverage type"));
    }
    if (this.coverage.typeVehicle && this.coverage.typeVehicle.length > 0) {
      return next(new Error("Life policy cannot have vehicle coverage types"));
    }
  } else if (this.policyType === "vehicle") {
    // For vehicle policies, typeVehicle is required and typeLife should be empty
    if (!this.coverage.typeVehicle || this.coverage.typeVehicle.length === 0) {
      return next(new Error("Vehicle policy must have at least one vehicle coverage type"));
    }
    if (this.coverage.typeLife && this.coverage.typeLife.length > 0) {
      return next(new Error("Vehicle policy cannot have life coverage types"));
    }
  }
  next();
});

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
//PolicySchema.index({ policyId: 1 });
PolicySchema.index({ policyType: 1 });
PolicySchema.index({ policyCategory: 1 });
PolicySchema.index({ beneficiaries: 1 });
PolicySchema.index({ status: 1 });
PolicySchema.index({ "validity.endDate": 1 });
PolicySchema.index({ insuranceAgent: 1 });

const Policy = mongoose.model("Policy", PolicySchema);
export default Policy;