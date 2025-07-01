"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutVideoProgressSchema = void 0;
const mongoose_1 = require("mongoose");
exports.WorkoutVideoProgressSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Client" },
    workoutId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Workout" },
    exerciseProgress: [
        {
            exerciseId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
            videoProgress: { type: Number, required: true, min: 0, max: 100 },
            status: {
                type: String,
                required: true,
                enum: ["Not Started", "In Progress", "Completed"],
                default: "Not Started",
            },
            lastUpdated: { type: Date, required: true, default: Date.now },
            clientTimestamp: { type: String, required: false },
        },
    ],
    completedExercises: [{ type: mongoose_1.Schema.Types.ObjectId }],
    lastUpdated: { type: Date, required: true, default: Date.now },
}, {
    timestamps: true,
});
exports.WorkoutVideoProgressSchema.index({ userId: 1, workoutId: 1, exerciseId: 1 }, { unique: true });
