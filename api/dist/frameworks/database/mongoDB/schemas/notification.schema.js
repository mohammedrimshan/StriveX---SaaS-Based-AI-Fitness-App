"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationSchema = void 0;
const mongoose_1 = require("mongoose");
exports.NotificationSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['INFO', 'WARNING', 'ERROR', 'SUCCESS'], required: true },
    isRead: { type: Boolean, default: false },
    actionLink: { type: String, required: false },
    relatedEntityId: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
});
exports.NotificationSchema.index({ relatedEntityId: 1 });
