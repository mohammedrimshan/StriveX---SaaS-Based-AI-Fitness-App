"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutProgressModel = void 0;
const mongoose_1 = require("mongoose");
const workout_progress_schema_1 = require("../schemas/workout-progress.schema");
exports.WorkoutProgressModel = (0, mongoose_1.model)("WorkoutProgress", workout_progress_schema_1.WorkoutProgressSchema);
