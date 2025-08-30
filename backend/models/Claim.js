import mongoose from "mongoose";

const ClaimSchema = new mongoose.Schema(
  {
    claimId: {
      type: String,
      //required: [true, "Claim ID is required"], //auto generated
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
      required: true,
    },
    
    // Life insurance coverage
    lifeClaimOption: {
      type: String,
      enum: ["hospitalization", "channelling", "medication", "death"],
      required: function () {
        return this.claimType === "lifex";
      },
    },
    
    // Vehicle insurance coverage
    vehicleClaimOption: {
      type: String,
      enum: ["accident", "theft", "fire", "naturalDisaster"],
      required: function () {
        return this.claimType === "vehiclex";
      },
    },

    // Claim lifecycle status tracking
    claimStatus: {
      type: String,
      enum: [
        "draft",           // Initial creation - basic info only
        "questionnaire_pending", // Questionnaire loaded but not completed
        "questionnaire_completed", // Employee completed questionnaire
        "submitted",       // Claim submitted with all required info
        "under_hr_review", // HR reviewing the claim
        "forwarded_to_insurer", // Sent to insurance agent
        "under_insurer_review", // Insurance agent reviewing
        "approved",        // Claim approved
        "rejected",        // Claim rejected
        "returned_to_employee", // Returned for more info/corrections
        "cancelled"        // Claim cancelled
      ],
      default: "draft",
      required: true,
    },

    // Workflow status flags
    statusFlags: {
      isQuestionnaireLoaded: {
        type: Boolean,
        default: false,
      },
      isQuestionnaireComplete: {
        type: Boolean,
        default: false,
      },
      isDocumentationComplete: {
        type: Boolean,
        default: false,
      },
      isReadyForSubmission: {
        type: Boolean,
        default: false,
      },
      hasBeenSubmitted: {
        type: Boolean,
        default: false,
      },
      requiresEmployeeAction: {
        type: Boolean,
        default: false,
      },
      requiresHRAction: {
        type: Boolean,
        default: false,
      },
      requiresInsurerAction: {
        type: Boolean,
        default: false,
      }
    },

    // Get the appropriate claim option regardless of type
    claimOption: {
      type: String,
      get: function() {
        return this.claimType === "life" ? this.lifeClaimOption : this.vehicleClaimOption;
      }
    },
    
    // Embedded QnA section - populated after claim option selection
    questionnaire: {
      templateReference: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "QuestionnaireTemplate",
      },
      templateSnapshot: {
        templateId: String,
        claimType: String,
        claimOption: String,
        title: String,
        version: Number,
        loadedAt: {
          type: Date,
          default: Date.now,
        }
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
          isRequired: {
            type: Boolean,
            default: true,
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
          answeredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        },
      ],
      completionStatus: {
        type: String,
        enum: ["not_loaded", "loaded", "in_progress", "completed", "reviewed"],
        default: "not_loaded",
      },
      completedAt: Date,
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      reviewedAt: Date,
      reviewNotes: {
        type: String,
        trim: true,
        maxlength: [500, "Review notes cannot exceed 500 characters"],
      },
    },

    // Claim amount - set after questionnaire completion
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

    // Legacy status for backward compatibility
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "approved", "rejected"],
    },

    // Current location and direction tracking
    currentLocation: {
      type: String,
      default: "employee",
      enum: ["employee", "hr", "insurer"],
      required: true,
    },
    lastDirection: {
      type: String,
      enum: ["forward", "reverse"],
      default: "forward",
    },

    // Workflow history
    workflowHistory: [
      {
        from: String,
        to: String,
        action: String,
        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        notes: String,
      }
    ],

    // Separate notes fields for each actor
    notes: {
      employee: [
        {
          note: {
            type: String,
            required: true,
            trim: true,
            maxlength: [1000, "Employee note cannot exceed 1000 characters"],
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      hr: [
        {
          note: {
            type: String,
            required: true,
            trim: true,
            maxlength: [1000, "HR note cannot exceed 1000 characters"],
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      insurer: [
        {
          note: {
            type: String,
            required: true,
            trim: true,
            maxlength: [1000, "Insurer note cannot exceed 1000 characters"],
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
    
    documents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
        required: false,
      },
    ],
    priority: {
      type: String,
      default: "normal",
      enum: ["low", "normal", "high", "urgent"],
    },

    // Timestamps for key lifecycle events
    submittedAt: Date,
    reviewStartedAt: Date,
    forwardedAt: Date,
    decidedAt: Date,
  },
  { 
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);

// Method to load questionnaire template based on claim type and option
ClaimSchema.methods.loadQuestionnaire = async function() {
  try {
    const claimOption = this.claimType === "life" ? this.lifeClaimOption : this.vehicleClaimOption;
    
    if (!claimOption) {
      throw new Error("Claim option must be set before loading questionnaire");
    }

    const template = await mongoose.model("QuestionnaireTemplate").findOne({
      claimType: this.claimType,
      claimOption: claimOption,
      isActive: true
    });

    if (!template) {
      throw new Error(`No active questionnaire template found for ${this.claimType} - ${claimOption}`);
    }

    // Store template reference and snapshot
    this.questionnaire.templateReference = template._id;
    this.questionnaire.templateSnapshot = {
      templateId: template.templateId,
      claimType: template.claimType,
      claimOption: claimOption,
      title: template.title,
      version: template.version,
      loadedAt: new Date(),
    };

    // Initialize responses from template questions
    this.questionnaire.responses = template.questions
      .sort((a, b) => a.order - b.order)
      .map((question) => ({
        questionId: question.questionId,
        questionText: question.questionText,
        questionType: question.questionType,
        isRequired: question.isRequired,
        answer: {},
        isAnswered: false,
      }));

    // Update status flags and claim status
    this.questionnaire.completionStatus = "loaded";
    this.statusFlags.isQuestionnaireLoaded = true;
    this.claimStatus = "questionnaire_pending";
    
    // Add to workflow history
    this.workflowHistory.push({
      from: "draft",
      to: "questionnaire_pending",
      action: "questionnaire_loaded",
      performedBy: this.employeeId,
      timestamp: new Date(),
      notes: `Questionnaire template ${template.templateId} loaded`
    });
    
    return this.save();
  } catch (error) {
    throw error;
  }
};

// Method to update questionnaire answer
ClaimSchema.methods.updateQuestionnaireAnswer = function(questionId, answerValue, userId) {
  if (!this.statusFlags.isQuestionnaireLoaded) {
    throw new Error("Questionnaire not loaded");
  }

  if (!this.questionnaire.responses) {
    throw new Error("No questionnaire responses available");
  }

  const response = this.questionnaire.responses.find((r) => r.questionId === questionId);
  if (!response) {
    throw new Error("Question not found");
  }

  // Clear previous answer values
  response.answer = {};

  // Set the appropriate answer field based on question type
  switch (response.questionType) {
    case "text":
      response.answer.textValue = answerValue;
      break;
    case "number":
      response.answer.numberValue = answerValue;
      break;
    case "date":
      response.answer.dateValue = answerValue;
      break;
    case "boolean":
      response.answer.booleanValue = answerValue;
      break;
    case "select":
      response.answer.selectValue = answerValue;
      break;
    case "multiselect":
      response.answer.multiselectValue = answerValue;
      break;
    case "file":
      response.answer.fileValue = answerValue;
      break;
  }

  response.isAnswered = true;
  response.answeredAt = new Date();
  response.answeredBy = userId;

  // Update questionnaire completion status
  this.questionnaire.completionStatus = "in_progress";
  
  return this.save();
};

// Method to check and update questionnaire completion
ClaimSchema.methods.checkQuestionnaireCompletion = function() {
  if (!this.questionnaire.responses || this.questionnaire.responses.length === 0) {
    return false;
  }

  // Check if all required questions are answered
  const requiredQuestions = this.questionnaire.responses.filter(r => r.isRequired);
  const answeredRequired = requiredQuestions.filter(r => r.isAnswered);
  const allRequiredAnswered = requiredQuestions.length === answeredRequired.length;
  
  if (allRequiredAnswered && this.questionnaire.completionStatus !== "completed") {
    this.questionnaire.completionStatus = "completed";
    this.questionnaire.completedAt = new Date();
    this.statusFlags.isQuestionnaireComplete = true;
    this.claimStatus = "questionnaire_completed";
    
    // Add to workflow history
    this.workflowHistory.push({
      from: "questionnaire_pending",
      to: "questionnaire_completed",
      action: "questionnaire_completed",
      performedBy: this.employeeId,
      timestamp: new Date(),
      notes: "All required questions answered"
    });
  }

  return allRequiredAnswered;
};

// Method to check if claim is ready for submission
ClaimSchema.methods.checkSubmissionReadiness = function() {
  const isReady = this.statusFlags.isQuestionnaireComplete && 
                  this.claimAmount.requested > 0;
  
  this.statusFlags.isReadyForSubmission = isReady;
  return isReady;
};

// Method to submit claim
ClaimSchema.methods.submitClaim = function(userId) {
  if (!this.checkSubmissionReadiness()) {
    throw new Error("Claim is not ready for submission");
  }

  this.claimStatus = "submitted";
  this.statusFlags.hasBeenSubmitted = true;
  this.statusFlags.requiresHRAction = true;
  this.statusFlags.requiresEmployeeAction = false;
  this.submittedAt = new Date();
  this.currentLocation = "hr";

  // Add to workflow history
  this.workflowHistory.push({
    from: "questionnaire_completed",
    to: "submitted",
    action: "claim_submitted",
    performedBy: userId,
    timestamp: new Date(),
    notes: `Claim submitted with amount ${this.claimAmount.requested}`
  });

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
//ClaimSchema.index({ claimId: 1 });
ClaimSchema.index({ employeeId: 1 });
ClaimSchema.index({ policy: 1 });
ClaimSchema.index({ claimStatus: 1 });
ClaimSchema.index({ currentLocation: 1 });
ClaimSchema.index({ claimType: 1 });
ClaimSchema.index({ priority: 1 });
ClaimSchema.index({ createdAt: -1 });
ClaimSchema.index({ "questionnaire.completionStatus": 1 });
ClaimSchema.index({ "statusFlags.requiresEmployeeAction": 1 });
ClaimSchema.index({ "statusFlags.requiresHRAction": 1 });
ClaimSchema.index({ "statusFlags.requiresInsurerAction": 1 });

const Claim = mongoose.model("Claim", ClaimSchema);
export default Claim;