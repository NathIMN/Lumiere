import mongoose from "mongoose";

// Define valid combinations
const VALID_CLAIM_COMBINATIONS = {
  life: ["hospitalization", "channelling", "medication", "death"],
  vehicle: ["accident", "theft", "fire", "naturalDisaster"]
};

const QuestionnaireTemplateSchema = new mongoose.Schema(
  {
    templateId: {
      type: String,
      //required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    claimType: {
      type: String,
      enum: ["life", "vehicle"],
      required: true,
    },
    claimOption: {
      type: String,
      required: true,
      validate: {
        validator: function(value) {
          return VALID_CLAIM_COMBINATIONS[this.claimType]?.includes(value);
        },
        message: props => `${props.value} is not a valid option for claim type ${props.instance.claimType}`
      }
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    questions: [
      {
        category: {
          type: String,
          required: true,
        },
        questionId: {
          type: String,
          required: true,
        },
        questionText: {
          type: String,
          required: true,
          trim: true,
        },
        questionType: {
          type: String,
          enum: ["text", "number", "date", "boolean", "select", "multiselect", "file"],
          required: true,
        },
        options: [String], // For select/multiselect questions
        isRequired: {
          type: Boolean,
          default: true,
        },
        validation: {
          min: Number,
          max: Number,
          pattern: String,
          message: String,
        },
        order: {
          type: Number,
          required: true,
        },
        helpText: {
          type: String,
          trim: true,
        }
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

// Compound unique index to ensure one template per claimType + claimOption combination
QuestionnaireTemplateSchema.index({ claimType: 1, claimOption: 1 }, { unique: true });

// Auto-generate templateId based on claim type and option
QuestionnaireTemplateSchema.pre("save", async function (next) {
  if (this.isNew && !this.templateId) {
    try {
      const typePrefix = this.claimType === "life" ? "LIFE" : "VEHICLE";
      
      // Create specific suffix based on option
      const optionSuffixes = {
        life: {
          hospitalization: "HOSP",
          channelling: "CHANNEL", 
          medication: "MEDIC",
          death: "DEATH"
        },
        vehicle: {
          accident: "ACC",
          theft: "THEFT",
          fire: "FIRE",
          naturalDisaster: "NATURAL"
        }
      };
      
      const suffix = optionSuffixes[this.claimType][this.claimOption];
      this.templateId = `${typePrefix}_${suffix}`;
      
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Pre-save validation to ensure only valid combinations
QuestionnaireTemplateSchema.pre("save", function(next) {
  if (!VALID_CLAIM_COMBINATIONS[this.claimType]?.includes(this.claimOption)) {
    return next(new Error(`Invalid claim option '${this.claimOption}' for claim type '${this.claimType}'`));
  }
  
  // Update lastModified
  this.lastModified = new Date();
  next();
});

// Method to get all valid combinations
QuestionnaireTemplateSchema.statics.getValidCombinations = function() {
  return VALID_CLAIM_COMBINATIONS;
};

// Method to check if a combination exists
QuestionnaireTemplateSchema.statics.findByCombination = function(claimType, claimOption) {
  return this.findOne({ claimType, claimOption, isActive: true });
};

// Additional indexes
//QuestionnaireTemplateSchema.index({ templateId: 1 });
QuestionnaireTemplateSchema.index({ isActive: 1 });
QuestionnaireTemplateSchema.index({ version: -1 });

const QuestionnaireTemplate = mongoose.model("QuestionnaireTemplate", QuestionnaireTemplateSchema);

export { QuestionnaireTemplate, VALID_CLAIM_COMBINATIONS };