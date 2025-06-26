"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserWorkoutPreferenceSchema = void 0;
// api\src\frameworks\database\mongoDB\schemas\user-workout-preference.schema.ts
const mongoose_1 = require("mongoose");
const CustomRestDurationSchema = new mongoose_1.Schema({
    exerciseIndex: { type: Number, required: true },
    restDuration: { type: Number, required: true }, // in seconds
});
exports.UserWorkoutPreferenceSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    workoutId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Workout", required: true },
    customRestDurations: [CustomRestDurationSchema],
}, { timestamps: true });
