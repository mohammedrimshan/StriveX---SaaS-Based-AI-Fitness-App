"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DietPlanSchema = void 0;
const mongoose_1 = require("mongoose");
// Diet Plan Model
const MealSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    time: { type: String, required: true },
    foods: [String],
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fats: { type: Number, required: true },
    notes: String
});
const DietDaySchema = new mongoose_1.Schema({
    day: { type: String, required: true },
    meals: [MealSchema],
    totalCalories: { type: Number, required: true },
    totalProtein: { type: Number, required: true },
    totalCarbs: { type: Number, required: true },
    totalFats: { type: Number, required: true },
    waterIntake: { type: Number, required: true }
});
exports.DietPlanSchema = new mongoose_1.Schema({
    clientId: {
        type: String,
        required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    weeklyPlan: [DietDaySchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date }
});
