"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutProgressSchema = void 0;
const mongoose_1 = require("mongoose");
exports.WorkoutProgressSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Client" },
    workoutId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Workout" },
    categoryId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "Category" },
    date: { type: Date, required: true, default: Date.now },
    duration: { type: Number, required: true },
    caloriesBurned: { type: Number, required: true },
    completed: { type: Boolean, required: true, default: false },
}, {
    timestamps: true,
});
exports.WorkoutProgressSchema.index({ userId: 1, workoutId: 1, date: 1 });
