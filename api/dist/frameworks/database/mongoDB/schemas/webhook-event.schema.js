"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookEventSchema = void 0;
const mongoose_1 = require("mongoose");
exports.webhookEventSchema = new mongoose_1.Schema({
    eventId: { type: String, required: true, unique: true },
    processedAt: { type: Date, required: true },
}, { timestamps: true });
