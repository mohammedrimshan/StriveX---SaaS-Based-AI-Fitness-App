"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrainerChangeRequestSchema = void 0;
const mongoose_1 = require("mongoose");
const constants_1 = require("@/shared/constants");
exports.TrainerChangeRequestSchema = new mongoose_1.Schema({
    clientId: { type: String, required: true, index: true },
    backupTrainerId: { type: String, required: true },
    requestType: { type: String, enum: ["CHANGE", "REVOKE"], required: true },
    reason: { type: String, required: true },
    status: {
        type: String,
        enum: Object.values(constants_1.TrainerChangeRequestStatus),
        default: constants_1.TrainerChangeRequestStatus.PENDING,
    },
    createdAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date, required: false },
    resolvedBy: { type: String, required: false },
});
exports.TrainerChangeRequestSchema.index({ clientId: 1, status: 1 });
