import { Schema } from 'mongoose';
import { ICommentModel } from '../models/command.model';

export const commentSchema = new Schema<ICommentModel>(
    {
      postId: { type: String, required: true },
      authorId: { type: String, required: true },
      textContent: { type: String, required: true },
      likes: [{ type: String }],
      isDeleted: { type: Boolean, default: false },
      reports: [
        {
          userId: { type: String, required: true },
          reason: { type: String, required: true },
          reportedAt: { type: Date, default: Date.now },
        },
      ],
    },
    { timestamps: true }
  );
  
  commentSchema.index({ postId: 1 });
  commentSchema.index({ createdAt: -1 });