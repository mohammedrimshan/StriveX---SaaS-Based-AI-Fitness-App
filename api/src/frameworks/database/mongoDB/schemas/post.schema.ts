import { Schema } from 'mongoose';
import { IPostModel } from '../models/post.model';

const reportSchema = new Schema({
  userId: { type: String, required: true },
  reason: { type: String, required: true },
  reportedAt: { type: Date, default: Date.now },
});

const authorSchema = new Schema({
  _id: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, default: '' },
  email: { type: String, required: true },
  profileImage: { type: String },
}, { _id: false });

export const postSchema = new Schema<IPostModel>(
  {
    authorId: { type: String, required: true },
    role: { type: String, enum: ['client', 'trainer', 'admin'], required: true },
    textContent: { type: String, required: true },
    mediaUrl: { type: String },
    category: { type: String, required: true },
    likes: [{ type: String }],
    isDeleted: { type: Boolean, default: false },
    reports: [reportSchema],
    author: { type: authorSchema, default: null }, 
  },
  { timestamps: true }
);

postSchema.index({ authorId: 1 });
postSchema.index({ category: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ likes: 1 });