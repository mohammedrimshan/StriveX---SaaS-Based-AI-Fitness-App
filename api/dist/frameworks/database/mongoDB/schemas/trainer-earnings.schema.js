"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trainerEarningsSchema = void 0;
const mongoose_1 = require("mongoose");
exports.trainerEarningsSchema = new mongoose_1.Schema({
    slotId: { type: String, required: true },
    trainerId: { type: String, required: true },
    clientId: { type: String, required: true },
    membershipPlanId: { type: String, required: true },
    amount: { type: Number, required: true },
    trainerShare: { type: Number, required: true },
    adminShare: { type: Number, required: true },
    completedAt: { type: Date, required: true },
}, { timestamps: true });
exports.trainerEarningsSchema.index({ slotId: 1 }, { unique: true });
exports.trainerEarningsSchema.index({ trainerId: 1, completedAt: 1 });
