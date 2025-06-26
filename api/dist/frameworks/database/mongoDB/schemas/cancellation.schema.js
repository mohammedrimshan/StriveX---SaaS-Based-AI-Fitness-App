"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancellationSchema = void 0;
const mongoose_1 = require("mongoose");
exports.cancellationSchema = new mongoose_1.Schema({
    slotId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Slot" },
    clientId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Client" },
    trainerId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Trainer" },
    cancellationReason: { type: String, required: true },
    cancelledBy: {
        type: String,
        enum: ["trainer", "client"],
        required: true,
    },
    cancelledAt: { type: Date, required: true, default: Date.now },
}, {
    timestamps: true,
});
exports.cancellationSchema.index({ slotId: 1, trainerId: 1 });
exports.cancellationSchema.index({ cancelledAt: 1 });
