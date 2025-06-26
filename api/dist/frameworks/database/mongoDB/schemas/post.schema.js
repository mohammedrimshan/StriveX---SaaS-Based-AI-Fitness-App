"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postSchema = void 0;
const mongoose_1 = require("mongoose");
const reportSchema = new mongoose_1.Schema({
    userId: { type: String, required: true },
    reason: { type: String, required: true },
    reportedAt: { type: Date, default: Date.now },
});
const authorSchema = new mongoose_1.Schema({
    _id: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, default: '' },
    email: { type: String, required: true },
    profileImage: { type: String },
}, { _id: false });
exports.postSchema = new mongoose_1.Schema({
    authorId: { type: String, required: true },
    role: { type: String, enum: ['client', 'trainer', 'admin'], required: true },
    textContent: { type: String, required: true },
    mediaUrl: { type: String },
    category: { type: String, required: true },
    likes: [{ type: String }],
    isDeleted: { type: Boolean, default: false },
    reports: [reportSchema],
    author: { type: authorSchema, default: null },
}, { timestamps: true });
exports.postSchema.index({ authorId: 1 });
exports.postSchema.index({ category: 1 });
exports.postSchema.index({ createdAt: -1 });
exports.postSchema.index({ likes: 1 });
