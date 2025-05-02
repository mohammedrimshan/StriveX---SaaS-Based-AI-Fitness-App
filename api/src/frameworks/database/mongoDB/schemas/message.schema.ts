import { Schema } from "mongoose";
import { MessageStatus } from "@/shared/constants";

export const messageSchema = new Schema(
  {
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    content: { type: String, required: false },
    status: {
      type: String,
      enum: Object.values(MessageStatus),
      default: MessageStatus.SENT,
    },
    readAt: { type: Date },
    mediaUrl: { type: String },
    mediaType: { type: String, enum: ["image", "video", "file", null], default: null },
    deleted: { type: Boolean, default: false },
    replyToId: { type: String, required: false },
    reactions: [
      {
        userId: { type: String, required: true },
        emoji: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, status: 1 });