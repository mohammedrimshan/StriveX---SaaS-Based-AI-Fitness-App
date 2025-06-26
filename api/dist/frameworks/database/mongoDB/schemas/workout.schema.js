"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutSchema = void 0;
const mongoose_1 = require("mongoose");
const ExerciseSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    videoUrl: { type: String, required: true },
    defaultRestDuration: { type: Number, required: true },
});
exports.WorkoutSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: mongoose_1.Schema.Types.ObjectId, ref: "Category", required: true },
    duration: { type: Number, required: true },
    difficulty: {
        type: String,
        required: true,
        enum: ["Beginner", "Intermediate", "Advanced"],
    },
    imageUrl: { type: String },
    exercises: [ExerciseSchema],
    isPremium: { type: Boolean, default: false },
    status: { type: Boolean, default: true },
}, { timestamps: true });
