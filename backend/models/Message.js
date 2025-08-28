import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: [true, "Conversation ID is required"],
      trim: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
    },
    recipients: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        readAt: {
          type: Date,
        },
        deliveredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    content: {
      text: {
        type: String,
        required: [true, "Message content is required"],
        trim: true,
        maxlength: [2000, "Message cannot exceed 2000 characters"],
      },
      attachments: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Document",
        },
      ],
    },
    messageType: {
      type: String,
      default: "text",
      enum: ["text", "file", "system", "notification"],
    },
    context: {
      relatedTo: {
        type: String,
        enum: ["claim", "policy", "general", "support"],
      },
      referenceId: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
    priority: {
      type: String,
      default: "normal",
      enum: ["low", "normal", "high", "urgent"],
    },
    status: {
      type: String,
      default: "sent",
      enum: ["draft", "sent", "delivered", "read", "archived"],
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        reaction: {
          type: String,
          enum: ["like", "dislike", "helpful", "resolved"],
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });
MessageSchema.index({ "recipients.user": 1 });
MessageSchema.index({ status: 1 });

const Message = mongoose.model("Message", MessageSchema);
export default Message;