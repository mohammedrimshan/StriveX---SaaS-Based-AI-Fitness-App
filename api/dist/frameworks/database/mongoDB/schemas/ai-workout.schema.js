"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutPlanSchema = void 0;
// Workout Plan Model
const mongoose_1 = require("mongoose");
const WorkoutExerciseSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    sets: { type: Number, required: true },
    reps: { type: mongoose_1.Schema.Types.Mixed, required: true },
    duration: String,
    restTime: String,
    notes: String
});
const WorkoutDaySchema = new mongoose_1.Schema({
    day: { type: String, required: true },
    focus: { type: String, required: true },
    exercises: [WorkoutExerciseSchema],
    warmup: String,
    cooldown: String
});
exports.WorkoutPlanSchema = new mongoose_1.Schema({
    clientId: {
        type: String,
        required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    weeklyPlan: [WorkoutDaySchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date }
});
