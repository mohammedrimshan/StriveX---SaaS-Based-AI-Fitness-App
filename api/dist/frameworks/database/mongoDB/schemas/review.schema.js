"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewSchema = void 0;
const mongoose_1 = require("mongoose");
exports.reviewSchema = new mongoose_1.Schema({
    clientId: { type: String, required: true },
    trainerId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: false },
    clientProfileImage: { type: String, required: false },
    clientName: { type: String, required: true },
}, {
    timestamps: true,
});
exports.reviewSchema.index({ trainerId: 1, clientId: 1 }, { unique: true });
