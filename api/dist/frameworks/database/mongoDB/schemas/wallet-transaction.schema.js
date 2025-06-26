"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletTransactionSchema = void 0;
const mongoose_1 = require("mongoose");
const constants_1 = require("@/shared/constants");
exports.walletTransactionSchema = new mongoose_1.Schema({
    clientId: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: Object.values(constants_1.WalletTransactionType), required: true },
    reason: { type: String, required: true },
}, { timestamps: true });
exports.walletTransactionSchema.index({ clientId: 1, createdAt: 1 });
