"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutVideoProgressModel = void 0;
const mongoose_1 = require("mongoose");
const workout_video_progress_schema_1 = require("../schemas/workout-video-progress.schema");
exports.WorkoutVideoProgressModel = (0, mongoose_1.model)("WorkoutVideoProgress", workout_video_progress_schema_1.WorkoutVideoProgressSchema);
