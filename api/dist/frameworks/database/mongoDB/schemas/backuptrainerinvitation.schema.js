"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupTrainerInvitationSchema = void 0;
const mongoose_1 = require("mongoose");
const constants_1 = require("@/shared/constants");
exports.BackupTrainerInvitationSchema = new mongoose_1.Schema({
    clientId: { type: String, required: true, index: true },
    trainerId: { type: String, required: true, index: true },
    status: {
        type: String,
        enum: Object.values(constants_1.BackupInvitationStatus),
        required: true,
        default: constants_1.BackupInvitationStatus.PENDING,
    },
    sentAt: { type: Date, default: Date.now },
    respondedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true },
    isFallback: { type: Boolean, default: false },
});
