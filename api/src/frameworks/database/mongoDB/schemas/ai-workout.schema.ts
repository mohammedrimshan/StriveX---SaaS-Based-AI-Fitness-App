// Workout Plan Model
import mongoose, { Schema } from "mongoose";
import { IWorkoutPlan } from "@/entities/models/ai-workout-plan.entity";
import { IWorkoutPlanModel } from "../models/ai-workout.model";
const WorkoutExerciseSchema = new Schema({
    name: { type: String, required: true },
    sets: { type: Number, required: true },
    reps: { type: Schema.Types.Mixed, required: true },
    duration: String,
    restTime: String,
    notes: String
});

const WorkoutDaySchema = new Schema({
    day: { type: String, required: true },
    focus: { type: String, required: true },
    exercises: [WorkoutExerciseSchema],
    warmup: String,
    cooldown: String
});

export const WorkoutPlanSchema = new Schema<IWorkoutPlanModel>({
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

