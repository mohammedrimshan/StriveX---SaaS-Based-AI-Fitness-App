"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageSchema = void 0;
const mongoose_1 = require("mongoose");
const constants_1 = require("@/shared/constants");
exports.messageSchema = new mongoose_1.Schema({
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    content: { type: String, required: false },
    status: {
        type: String,
        enum: Object.values(constants_1.MessageStatus),
        default: constants_1.MessageStatus.SENT,
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
}, {
    timestamps: true,
});
exports.messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
exports.messageSchema.index({ receiverId: 1, status: 1 });
