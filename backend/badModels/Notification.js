import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: [true, "Recipient is required"] },
  title: { type: String, required: [true, "Notification title is required"], trim: true, maxlength: [100, "Title cannot exceed 100 characters"] },
  message: { type: String, required: [true, "Notification message is required"], trim: true, maxlength: [500, "Message cannot exceed 500 characters"] },
  type: { type: String, required: [true, "Notification type is required"], enum: { values: ["claim_status", "policy_update", "document_request", "payment_processed", "system", "reminder", "alert"], message: "Invalid notification type" } },
  category: { type: String, default: "info", enum: ["info", "success", "warning", "error"] },
  relatedTo: {
    model: { type: String, enum: ["Claim", "Policy", "User", "Message"] },
    id: { type: mongoose.Schema.Types.ObjectId }
  },
  actionRequired: { type: Boolean, default: false },
  actionUrl: { type: String, trim: true },
  expiresAt: { type: Date },
  priority: { type: String, default: "normal", enum: ["low", "normal", "high", "urgent"] },
  status: { type: String, default: "active", enum: ["active", "read", "archived", "expired"] }
}, { timestamps: true });

NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ status: 1 });
NotificationSchema.index({ expiresAt: 1 });

const Notification = mongoose.model("Notification", NotificationSchema);
export default Notification;