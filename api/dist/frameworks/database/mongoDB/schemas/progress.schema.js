"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressSchema = void 0;
// api/src/frameworks/database/mongoDB/models/progress.model.ts
const mongoose_1 = require("mongoose");
const CustomSessionSchema = new mongoose_1.Schema({
    exerciseDuration: { type: Number, required: true }, // in seconds
    restDuration: { type: Number, required: true } // in seconds
});
exports.ProgressSchema = new mongoose_1.Schema({
    clientId: { type: mongoose_1.Types.ObjectId, ref: 'User', required: true },
    workoutId: { type: mongoose_1.Types.ObjectId, ref: 'Workout', required: true },
    completedDuration: { type: Number, required: true }, // in minutes
    customSessions: [CustomSessionSchema],
    date: { type: Date, default: Date.now },
    caloriesBurned: { type: Number }
});
