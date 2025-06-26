"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionHistorySchema = void 0;
const mongoose_1 = require("mongoose");
const constants_1 = require("@/shared/constants");
exports.sessionHistorySchema = new mongoose_1.Schema({
    trainerId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Trainer" },
    trainerName: { type: String, required: true },
    clientId: { type: mongoose_1.Schema.Types.ObjectId, required: false, ref: "Client" },
    clientName: { type: String, required: false },
    date: {
        type: String,
        required: true,
        match: [/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"],
    },
    startTime: {
        type: String,
        required: true,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Start time must be in HH:mm format"],
    },
    endTime: {
        type: String,
        required: true,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "End time must be in HH:mm format"],
    },
    status: {
        type: String,
        enum: Object.values(constants_1.SlotStatus),
        required: true,
    },
    videoCallStatus: {
        type: String,
        enum: Object.values(constants_1.VideoCallStatus),
        default: constants_1.VideoCallStatus.NOT_STARTED,
    },
    bookedAt: { type: Date, required: false },
    cancellationReason: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, {
    timestamps: true,
});
exports.sessionHistorySchema.index({ trainerId: 1, date: 1 });
