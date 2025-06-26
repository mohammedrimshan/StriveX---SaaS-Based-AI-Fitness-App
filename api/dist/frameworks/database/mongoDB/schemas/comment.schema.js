"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentSchema = void 0;
const mongoose_1 = require("mongoose");
exports.commentSchema = new mongoose_1.Schema({
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
}, { timestamps: true });
exports.commentSchema.index({ postId: 1 });
exports.commentSchema.index({ createdAt: -1 });
