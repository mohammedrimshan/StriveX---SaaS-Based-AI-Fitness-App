"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutPlanModel = void 0;
const mongoose_1 = require("mongoose");
const ai_workout_schema_1 = require("../schemas/ai-workout.schema");
exports.WorkoutPlanModel = (0, mongoose_1.model)("WorkoutPlan", ai_workout_schema_1.WorkoutPlanSchema);
