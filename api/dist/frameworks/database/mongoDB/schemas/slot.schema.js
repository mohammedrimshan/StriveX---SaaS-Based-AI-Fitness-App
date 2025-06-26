"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slotSchema = void 0;
const mongoose_1 = require("mongoose");
const constants_1 = require("@/shared/constants");
exports.slotSchema = new mongoose_1.Schema({
    trainerId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Trainer" },
    backupTrainerId: { type: mongoose_1.Schema.Types.ObjectId, required: false, ref: "Trainer" },
    previousTrainerId: [{ type: mongoose_1.Schema.Types.ObjectId, required: false, ref: "Trainer", default: [] }],
    clientId: { type: String },
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
        default: constants_1.SlotStatus.AVAILABLE,
    },
    isBooked: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    expiresAt: { type: Date },
    bookedAt: { type: Date, required: false },
    cancellationReason: { type: String, required: false },
    videoCallRoomName: { type: String, required: false },
    videoCallJwt: { type: String, required: false },
    videoCallStatus: {
        type: String,
        enum: Object.values(constants_1.VideoCallStatus),
        default: constants_1.VideoCallStatus.NOT_STARTED,
    },
}, {
    timestamps: true,
});
exports.slotSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
exports.slotSchema.index({ trainerId: 1, startTime: 1, endTime: 1 });
exports.slotSchema.index({ videoCallRoomName: 1 });
