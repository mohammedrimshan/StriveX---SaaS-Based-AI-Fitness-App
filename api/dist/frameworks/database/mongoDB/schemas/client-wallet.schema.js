"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientWalletSchema = void 0;
const mongoose_1 = require("mongoose");
exports.clientWalletSchema = new mongoose_1.Schema({
    clientId: { type: String, required: true, unique: true },
    balance: { type: Number, required: true, default: 0 },
}, { timestamps: true });
exports.clientWalletSchema.index({ clientId: 1 }, { unique: true });
