import mongoose from "mongoose";

const VALID_CLAIM_COMBINATIONS = {
  life: ["hospitalization", "channelling", "medication", "death"],
  vehicle: ["accident", "theft", "fire", "naturalDisaster"],
};

// Question Schema (same as your current)
const QuestionSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  questionText: { type: String, required: true, trim: true },
  questionType: {
    type: String,
    enum: ["text", "number", "date", "boolean", "select", "multiselect", "file"],
    required: true,
  },
  options: [String],
  isRequired: { type: Boolean, default: true },
  validation: {
    min: String,
    max: String,
    minLength: Number,
    maxLength: Number,
    pattern: String,
    disable: String,
    message: String,
  },
  order: { type: Number, required: true },
  helpText: { type: String, trim: true },
});

// ✅ Section Schema added
const SectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, trim: true },
  order: { type: Number, required: true },
  questions: [QuestionSchema],
});

const QuestionnaireTemplateSchema = new mongoose.Schema(
  {
    templateId: {
      type: String,
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
        validator: function (value) {
          return VALID_CLAIM_COMBINATIONS[this.claimType]?.includes(value);
        },
        message: (props) =>
          `${props.value} is not a valid option for claim type ${props.instance.claimType}`,
      },
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    // ✅ Replaces flat questions
    sections: [SectionSchema],

    isActive: { type: Boolean, default: true },
    version: { type: Number, default: 1 },
    lastModified: { type: Date, default: Date.now },
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Compound unique index to ensure one template per claimType + claimOption combination
QuestionnaireTemplateSchema.index({ claimType: 1, claimOption: 1 }, { unique: true });

// Additional indexes
QuestionnaireTemplateSchema.index({ isActive: 1 });
QuestionnaireTemplateSchema.index({ version: -1 });
// Optional indexes if you query sections/questions a lot
// QuestionnaireTemplateSchema.index({ "sections.order": 1 });
// QuestionnaireTemplateSchema.index({ "sections.questions.questionId": 1 });

QuestionnaireTemplateSchema.pre("save", async function (next) {
  if (this.isNew && !this.templateId) {
    const typePrefix = this.claimType === "life" ? "LIFE" : "VEHICLE";
    const optionSuffixes = {
      life: { hospitalization: "HOSP", channelling: "CHANNEL", medication: "MEDIC", death: "DEATH" },
      vehicle: { accident: "ACC", theft: "THEFT", fire: "FIRE", naturalDisaster: "NATURAL" },
    };
    const suffix = optionSuffixes[this.claimType][this.claimOption];
    this.templateId = `${typePrefix}_${suffix}`;
  }
  this.lastModified = new Date();
  next();
});

QuestionnaireTemplateSchema.statics.getValidCombinations = function () {
  return VALID_CLAIM_COMBINATIONS;
};

QuestionnaireTemplateSchema.statics.findByCombination = function (claimType, claimOption) {
  return this.findOne({ claimType, claimOption, isActive: true });
};

const QuestionnaireTemplate = mongoose.model("QuestionnaireTemplate", QuestionnaireTemplateSchema);

export { QuestionnaireTemplate, VALID_CLAIM_COMBINATIONS };
