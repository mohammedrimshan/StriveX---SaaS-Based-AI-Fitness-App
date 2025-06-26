"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserWorkoutPreferenceModel = void 0;
// api\src\frameworks\database\mongoDB\models\user-workout-preference.model.ts
const mongoose_1 = require("mongoose");
const user_workout_preference_schema_1 = require("../schemas/user-workout-preference.schema");
exports.UserWorkoutPreferenceModel = (0, mongoose_1.model)("UserWorkoutPreference", user_workout_preference_schema_1.UserWorkoutPreferenceSchema);
