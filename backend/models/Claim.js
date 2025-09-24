import mongoose from "mongoose";

const ClaimSchema = new mongoose.Schema(
  {
    claimId: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
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
      required: [true, "Claim type is required"],
    },
    
    // Life insurance claim options
    lifeClaimOption: {
      type: String,
      enum: ["hospitalization", "channelling", "medication", "death"],
      required: function () {
        return this.claimType === "life";
      },
    },
    
    // Vehicle insurance claim options
    vehicleClaimOption: {
      type: String,
      enum: ["accident", "theft", "fire", "naturalDisaster"],
      required: function () {
        return this.claimType === "vehicle";
      },
    },

    // Simplified claim status - linear workflow
    claimStatus: {
      type: String,
      enum: [
        "draft",           // Initial creation - empty claim with type and option
        "employee",        // Employee needs to complete questionnaire and submit
        "hr",              // HR needs to review and forward to insurer
        "insurer",         // Insurance agent needs to review and decide
        "approved",        // Final state - claim approved
        "rejected"         // Final state - claim rejected
      ],
      default: "draft",
      required: true,
    },

    // Get the appropriate claim option regardless of type
    claimOption: {
      type: String,
      get: function() {
        return this.claimType === "life" ? this.lifeClaimOption : this.vehicleClaimOption;
      }
    },
    
    // Questionnaire with sections
    questionnaire: {
      templateReference: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "QuestionnaireTemplate",
      },
      sections: [
        {
          sectionId: {
            type: String,
            required: true,
          },
          title: {
            type: String,
            required: true,
          },
          description: {
            type: String,
          },
          order: {
            type: Number,
            required: true,
          },
          responses: [
            {
              questionId: {
                type: String,
                required: true,
              },
              questionText: {
                type: String,
                required: true,
              },
              questionType: {
                type: String,
                enum: ["text", "number", "date", "boolean", "select", "multiselect", "file"],
                required: true,
              },
              options: [String],
              isRequired: {
                type: Boolean,
                default: true,
              },
              order: {
                type: Number,
                required: true,
              },
              answer: {
                textValue: String,
                numberValue: Number,
                dateValue: Date,
                booleanValue: Boolean,
                selectValue: String,
                multiselectValue: [String],
                fileValue: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "Document",
                },
              },
              isAnswered: {
                type: Boolean,
                default: false,
              },
              answeredAt: Date,
            },
          ],
          isComplete: {
            type: Boolean,
            default: false,
          },
          completedAt: Date,
        },
      ],
      isComplete: {
        type: Boolean,
        default: false,
      },
      completedAt: Date,
    },

    // Claim amounts
    claimAmount: {
      requested: {
        type: Number,
        min: [0, "Claim amount cannot be negative"],
      },
      approved: {
        type: Number,
        default: 0,
        min: [0, "Approved amount cannot be negative"],
      },
    },

    // HR forwarding details (filled when HR forwards to insurer)
    hrForwardingDetails: {
      coverageBreakdown: [
        {
          coverageType: {
            type: String,
            required: true,
          },
          requestedAmount: {
            type: Number,
            required: true,
            min: 0,
          },
          notes: {
            type: String,
            trim: true,
          }
        }
      ],
      hrNotes: {
        type: String,
        trim: true,
        maxlength: [1000, "HR notes cannot exceed 1000 characters"],
      },
      forwardedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      forwardedAt: Date,
    },

    // Decision details (filled by insurer)
    decision: {
      status: {
        type: String,
        enum: ["approved", "rejected"],
      },
      approvedAmount: {
        type: Number,
        min: 0,
      },
      rejectionReason: {
        type: String,
        trim: true,
      },
      insurerNotes: {
        type: String,
        trim: true,
        maxlength: [1000, "Insurer notes cannot exceed 1000 characters"],
      },
      decidedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      decidedAt: Date,
    },

    // Return reasons (when claim is sent back)
    returnReason: {
      type: String,
      trim: true,
      maxlength: [500, "Return reason cannot exceed 500 characters"],
    },
    
    // Supporting documents
    documents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
      },
    ],

    // Important dates
    submittedAt: Date,
    forwardedToInsurerAt: Date,
    finalizedAt: Date,
  },
  { 
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);

// Updated method to load questionnaire template with sections
ClaimSchema.methods.loadQuestionnaire = async function() {
  try {
    const claimOption = this.claimType === "life" ? this.lifeClaimOption : this.vehicleClaimOption;
    if (!claimOption) throw new Error("Claim option must be set before loading questionnaire");

    const template = await mongoose.model("QuestionnaireTemplate").findOne({
      claimType: this.claimType,
      claimOption: claimOption,
      isActive: true
    });

    if (!template) throw new Error(`No active questionnaire template found for ${this.claimType} - ${claimOption}`);

    this.questionnaire.templateReference = template._id;

    // Process sections and questions
    this.questionnaire.sections = template.sections
      .sort((a, b) => a.order - b.order)
      .map((section, sectionIndex) => ({
        sectionId: section._id.toString(),
        title: section.title,
        description: section.description,
        order: section.order,
        responses: section.questions
          .sort((a, b) => a.order - b.order)
          .map(q => ({
            questionId: q.questionId,
            questionText: q.questionText,
            questionType: q.questionType,
            options: q.options,
            isRequired: q.isRequired,
            order: q.order,
            answer: {},
            isAnswered: false,
          })),
        isComplete: false,
      }));

    this.claimStatus = "draft";

    return this.save();
  } catch (error) {
    throw error;
  }
};

// Updated method to update questionnaire answer with section support
ClaimSchema.methods.updateQuestionnaireAnswer = function(questionId, answerValue) {
  let targetResponse = null;
  let targetSection = null;

  // Find the question across all sections
  for (const section of this.questionnaire.sections) {
    const response = section.responses.find(r => r.questionId === questionId);
    if (response) {
      targetResponse = response;
      targetSection = section;
      break;
    }
  }

  if (!targetResponse) {
    throw new Error("Question not found");
  }

  // Clear previous answer values
  targetResponse.answer = {};

  // Set the appropriate answer field based on question type
  switch (targetResponse.questionType) {
    case "text":
      targetResponse.answer.textValue = answerValue;
      break;
    case "number":
      targetResponse.answer.numberValue = answerValue;
      break;
    case "date":
      targetResponse.answer.dateValue = answerValue;
      break;
    case "boolean":
      targetResponse.answer.booleanValue = answerValue;
      break;
    case "select":
      targetResponse.answer.selectValue = answerValue;
      break;
    case "multiselect":
      targetResponse.answer.multiselectValue = answerValue;
      break;
    case "file":
      targetResponse.answer.fileValue = answerValue;
      break;
  }

  targetResponse.isAnswered = true;
  targetResponse.answeredAt = new Date();

  // Check if section is complete
  this.checkSectionCompletion(targetSection);

  return this.save();
};

// New method to check section completion
ClaimSchema.methods.checkSectionCompletion = function(section) {
  if (!section || !section.responses || section.responses.length === 0) {
    return false;
  }

  const requiredQuestions = section.responses.filter(r => r.isRequired);
  const answeredRequired = requiredQuestions.filter(r => r.isAnswered);
  const allRequiredAnswered = requiredQuestions.length === answeredRequired.length;
  
  if (allRequiredAnswered && !section.isComplete) {
    section.isComplete = true;
    section.completedAt = new Date();
  }

  // Check overall questionnaire completion
  this.checkQuestionnaireCompletion();

  return allRequiredAnswered;
};

// Updated method to check if questionnaire is complete
ClaimSchema.methods.checkQuestionnaireCompletion = function() {
  if (!this.questionnaire.sections || this.questionnaire.sections.length === 0) {
    return false;
  }

  // Check if all sections are complete
  const allSectionsComplete = this.questionnaire.sections.every(section => section.isComplete);
  
  if (allSectionsComplete && !this.questionnaire.isComplete) {
    this.questionnaire.isComplete = true;
    this.questionnaire.completedAt = new Date();
  } else if (!allSectionsComplete && this.questionnaire.isComplete) {
    // Reset completion if not all sections are complete
    this.questionnaire.isComplete = false;
    this.questionnaire.completedAt = undefined;
  }

  return allSectionsComplete;
};

// Helper method to get all questions flattened (for backward compatibility)
ClaimSchema.methods.getAllQuestions = function() {
  if (!this.questionnaire.sections) return [];
  
  return this.questionnaire.sections
    .sort((a, b) => a.order - b.order)
    .flatMap(section => 
      section.responses
        .sort((a, b) => a.order - b.order)
        .map(response => ({
          ...response.toObject(),
          sectionTitle: section.title,
          sectionId: section.sectionId
        }))
    );
};

// Method to submit claim (employee to HR)
ClaimSchema.methods.submitToHR = function() {
  if (!this.questionnaire.isComplete) {
    throw new Error("Questionnaire must be completed before submission");
  }
  
  if (!this.claimAmount.requested || this.claimAmount.requested <= 0) {
    throw new Error("Claim amount must be set before submission");
  }

  this.claimStatus = "hr";
  this.submittedAt = new Date();
  
  return this.save();
};

// Method to forward claim to insurer (HR to insurer)
ClaimSchema.methods.forwardToInsurer = function(coverageBreakdown, hrNotes, hrUserId) {
  if (this.claimStatus !== "hr") {
    throw new Error("Claim must be with HR to forward to insurer");
  }

  if (!coverageBreakdown || coverageBreakdown.length === 0) {
    throw new Error("Coverage breakdown is required when forwarding to insurer");
  }

  this.claimStatus = "insurer";
  this.hrForwardingDetails = {
    coverageBreakdown,
    hrNotes,
    forwardedBy: hrUserId,
    forwardedAt: new Date(),
  };
  this.forwardedToInsurerAt = new Date();

  return this.save();
};

// Method to make final decision (insurer)
ClaimSchema.methods.makeDecision = function(decision, insurerUserId) {
  if (this.claimStatus !== "insurer") {
    throw new Error("Claim must be with insurer to make decision");
  }

  if (!["approved", "rejected"].includes(decision.status)) {
    throw new Error("Decision status must be either approved or rejected");
  }

  this.claimStatus = decision.status;
  this.decision = {
    ...decision,
    decidedBy: insurerUserId,
    decidedAt: new Date(),
  };

  if (decision.status === "approved" && decision.approvedAmount) {
    this.claimAmount.approved = decision.approvedAmount;
  }

  this.finalizedAt = new Date();

  return this.save();
};

// Method to return claim to previous stage
ClaimSchema.methods.returnToPreviousStage = function(returnReason, currentUserId) {
  let newStatus;
  
  if (this.claimStatus === "hr") {
    newStatus = "employee";
  } else if (this.claimStatus === "insurer") {
    newStatus = "hr";
  } else {
    throw new Error("Cannot return claim from current status");
  }

  this.claimStatus = newStatus;
  this.returnReason = returnReason;

  return this.save();
};

// Validation middleware to ensure claim type matches policy type
ClaimSchema.pre("save", async function (next) {
  if (this.isModified("policy") || this.isModified("claimType")) {
    try {
      const populatedClaim = await this.populate({
        path: "policy",
        select: "policyType"
      });
      
      if (!populatedClaim.policy) {
        return next(new Error("Referenced policy not found"));
      }
      
      if (this.claimType !== populatedClaim.policy.policyType) {
        return next(new Error(`Claim type '${this.claimType}' does not match policy type '${populatedClaim.policy.policyType}'`));
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Validation middleware to ensure claim option matches claim type
ClaimSchema.pre("save", function (next) {
  const lifeOptions = ["hospitalization", "channelling", "medication", "death"];
  const vehicleOptions = ["accident", "theft", "fire", "naturalDisaster"];

  if (this.claimType === "life") {
    if (this.lifeClaimOption && !lifeOptions.includes(this.lifeClaimOption)) {
      return next(new Error(`Invalid life claim option: ${this.lifeClaimOption}`));
    }
    if (this.vehicleClaimOption) {
      return next(new Error("Life claims cannot have vehicle claim options"));
    }
  }

  if (this.claimType === "vehicle") {
    if (this.vehicleClaimOption && !vehicleOptions.includes(this.vehicleClaimOption)) {
      return next(new Error(`Invalid vehicle claim option: ${this.vehicleClaimOption}`));
    }
    if (this.lifeClaimOption) {
      return next(new Error("Vehicle claims cannot have life claim options"));
    }
  }

  next();
});

// Auto-generate claimId
ClaimSchema.pre("save", async function (next) {
  if (this.isNew && !this.claimId) {
    try {
      const typePrefix = this.claimType === "life" ? "LC" : "VC";
      
      const lastClaim = await this.constructor
        .findOne({ claimId: new RegExp(`^${typePrefix}`) })
        .sort({ claimId: -1 })
        .select("claimId");

      let nextNumber = 1;
      if (lastClaim && lastClaim.claimId) {
        const currentNumber = parseInt(lastClaim.claimId.substring(2));
        nextNumber = currentNumber + 1;
      }

      this.claimId = `${typePrefix}${nextNumber.toString().padStart(6, "0")}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Indexes for performance
ClaimSchema.index({ employeeId: 1 });
ClaimSchema.index({ policy: 1 });
ClaimSchema.index({ claimStatus: 1 });
ClaimSchema.index({ claimType: 1 });
ClaimSchema.index({ createdAt: -1 });

const Claim = mongoose.model("Claim", ClaimSchema);
export default Claim;