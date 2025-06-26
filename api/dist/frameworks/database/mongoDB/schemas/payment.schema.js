"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentSchema = void 0;
const mongoose_1 = require("mongoose");
const constants_1 = require("@/shared/constants");
exports.paymentSchema = new mongoose_1.Schema({
    clientId: { type: String, required: true },
    trainerId: { type: String, required: false },
    membershipPlanId: { type: String, required: true },
    amount: { type: Number, required: true },
    stripePaymentId: { type: String, required: false },
    stripeSessionId: { type: String, required: false },
    trainerAmount: { type: Number, required: false, default: 0 },
    adminAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: Object.values(constants_1.PaymentStatus),
        default: constants_1.PaymentStatus.PENDING,
    },
    remainingBalance: { type: Number, required: false, default: 0 },
}, { timestamps: true });
exports.paymentSchema.index({ stripePaymentId: 1 }, { unique: true, sparse: true });
exports.paymentSchema.index({ stripeSessionId: 1 }, { unique: true });
