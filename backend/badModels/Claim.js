import mongoose from "mongoose";

const ClaimSchema = new mongoose.Schema({
  claimId: { type: String, required: [true, "Claim ID is required"], unique: true, trim: true, uppercase: true },
  userId: { type: String, required: [true, "User ID is required"], ref: "User" },
  policyId: { type: mongoose.Schema.Types.ObjectId, required: [true, "Policy ID is required"], ref: "Policy" },
  type: { type: String, required: [true, "Claim type is required"], enum: ["medical", "life", "vehicle", "travel", "property", "disability"] },
  status: { type: String, default: "submitted", enum: { values: ["draft", "submitted", "under_review", "approved", "rejected", "partially_approved", "paid", "closed"], message: "Invalid claim status" } },
  priority: { type: String, default: "normal", enum: ["low", "normal", "high", "urgent"] },
  requestAmount: { type: Number, required: [true, "Request amount is required"], min: [0, "Request amount cannot be negative"] },
  approvedAmount: { type: Number, default: 0, min: [0, "Approved amount cannot be negative"] },
  submittedAt: { type: Date, default: Date.now, required: [true, "Submitted date is required"] },
  reviewedAt: { type: Date },
  resolvedAt: { type: Date },
  remarks: { type: String, trim: true, maxlength: [1000, "Remarks cannot exceed 1000 characters"] },
  incidentDate: { type: Date, required: [true, "Incident date is required"], validate: { validator: function (v) { return v <= new Date(); }, message: "Incident date cannot be in the future" } },
  description: { type: String, required: [true, "Claim description is required"], trim: true, maxlength: [1000, "Description cannot exceed 1000 characters"] },
  documents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }],
  reviewedBy: { type: String, ref: "User" },
  dependentId: { type: mongoose.Schema.Types.ObjectId },
  insuranceCompany: { type: String, required: [true, "Insurance company is required"], trim: true }
}, { timestamps: true });

ClaimSchema.index({ claimId: 1 });
ClaimSchema.index({ userId: 1 });
ClaimSchema.index({ policyId: 1 });
ClaimSchema.index({ status: 1 });
ClaimSchema.index({ type: 1 });
ClaimSchema.index({ incidentDate: -1 });
ClaimSchema.index({ submittedAt: -1 });
ClaimSchema.index({ insuranceCompany: 1 });

const Claim = mongoose.model("Claim", ClaimSchema);
export default Claim;