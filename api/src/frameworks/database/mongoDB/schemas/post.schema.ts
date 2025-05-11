import { Schema } from 'mongoose';
import { IPostModel } from '../models/post.model';

const reportSchema = new Schema({
    userId: { type: String, required: true },
    reason: { type: String, required: true },
    reportedAt: { type: Date, default: Date.now },
  });
  
 export const postSchema = new Schema<IPostModel>(
    {
      authorId: { type: String, required: true },
      role: { type: String, enum: ['client', 'trainer'], required: true },
      textContent: { type: String, required: true },
      mediaUrl: { type: String },
      category: { type: String, required: true },
      likes: [{ type: String }],
      isDeleted: { type: Boolean, default: false },
      reports: [reportSchema],
    },
    { timestamps: true }
  );
  
  postSchema.index({ authorId: 1 });
  postSchema.index({ category: 1 });
  postSchema.index({ createdAt: -1 });