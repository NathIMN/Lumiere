import mongoose from "mongoose";

const PolicySchema = new mongoose.Schema({
  policyId: { type: String, required: [true, "Policy ID is required"], unique: true, trim: true, uppercase: true },
  name: { type: String, required: [true, "Policy name is required"], trim: true, maxlength: [200, "Policy name cannot exceed 200 characters"] },
  type: { type: String, required: [true, "Policy type is required"], enum: { values: ["life", "medical", "vehicle", "travel", "property", "disability"], message: "Invalid policy type" } },
  category: { type: String, required: [true, "Policy category is required"], enum: ["individual", "group", "family"] },
  startDate: { type: Date, required: [true, "Policy start date is required"] },
  endDate: { type: Date, required: [true, "Policy end date is required"], validate: { validator: function (v) { return v > this.startDate; }, message: "End date must be after start date" } },
  premium: {
    amount: { type: Number, required: [true, "Premium amount is required"], min: [0, "Premium amount cannot be negative"] },
    frequency: { type: String, required: [true, "Premium frequency is required"], enum: ["monthly", "quarterly", "semi-annual", "annual"] }
  },
  coverageDetails: [{
    type: { type: String, required: true, enum: ["hospitalization", "surgery", "medication", "dental", "optical", "maternity", "accident", "death", "disability", "vehicle_damage", "third_party_liability", "theft", "other"] },
    description: { type: String, required: true, trim: true, maxlength: [500, "Coverage description cannot exceed 500 characters"] },
    coverageAmount: { type: Number, required: true, min: [0, "Coverage amount cannot be negative"] },
    deductible: { type: Number, default: 0, min: [0, "Deductible cannot be negative"] },
    usedAmount: { type: Number, default: 0, min: [0, "Used amount cannot be negative"] },
    remainingAmount: { type: Number, min: [0, "Remaining amount cannot be negative"] }
  }],
  insuranceCompany: { type: String, required: [true, "Insurance company is required"], trim: true, maxlength: [100, "Insurance company name cannot exceed 100 characters"] },
  status: { type: String, default: "active", enum: ["active", "expired", "cancelled", "suspended", "pending"] },
  eligibleUsers: [{
    userId: { type: String, required: true, ref: "User" },
    relationship: { type: String, required: true, enum: ["self", "spouse", "child", "parent", "dependent"] },
    isActive: { type: Boolean, default: true }
  }],
  totalCoverageAmount: { type: Number, required: [true, "Total coverage amount is required"], min: [0, "Total coverage amount cannot be negative"] },
  totalUsedAmount: { type: Number, default: 0, min: [0, "Total used amount cannot be negative"] },
  documents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }]
}, { timestamps: true });

PolicySchema.index({ policyId: 1 });
PolicySchema.index({ type: 1 });
PolicySchema.index({ category: 1 });
PolicySchema.index({ "eligibleUsers.userId": 1 });
PolicySchema.index({ status: 1 });
PolicySchema.index({ endDate: 1 });
PolicySchema.index({ insuranceCompany: 1 });

const Policy = mongoose.model("Policy", PolicySchema);
export default Policy;