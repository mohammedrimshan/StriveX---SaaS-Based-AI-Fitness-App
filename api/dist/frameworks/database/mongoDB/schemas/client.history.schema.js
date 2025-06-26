"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientProgressHistorySchema = void 0;
const mongoose_1 = require("mongoose");
exports.ClientProgressHistorySchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Client",
        required: true,
    },
    weight: {
        type: Number,
        default: 0,
    },
    height: {
        type: Number,
        default: 0,
    },
    waterIntake: {
        type: Number,
        default: 0,
    },
    waterIntakeTarget: {
        type: Number,
        default: 0,
    },
    date: {
        type: Date,
        required: true,
    },
}, {
    timestamps: true,
});
exports.ClientProgressHistorySchema.index({ userId: 1, date: -1 });
