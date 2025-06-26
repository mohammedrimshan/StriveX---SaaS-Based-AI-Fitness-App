"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutModel = void 0;
const mongoose_1 = require("mongoose");
const workout_schema_1 = require("../schemas/workout.schema");
exports.WorkoutModel = (0, mongoose_1.model)("Workout", workout_schema_1.WorkoutSchema);
