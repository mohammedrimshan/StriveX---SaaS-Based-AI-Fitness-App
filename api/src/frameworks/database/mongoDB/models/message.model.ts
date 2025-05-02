import { Document, ObjectId, model } from "mongoose";
import { messageSchema } from "../schemas/message.schema";

export interface IMessageModel extends Document {
  _id: ObjectId;
  senderId: string;
  receiverId: string;
  content: string;
  status: string;
  readAt?: Date;
  mediaUrl?: string;
  mediaType?: string | null;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  replyToId?: string;
  reactions?: Array<{ userId: string; emoji: string }>;
}

export const MessageModel = model<IMessageModel>("Message", messageSchema);