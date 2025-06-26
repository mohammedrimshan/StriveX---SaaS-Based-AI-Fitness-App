"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressModel = void 0;
const mongoose_1 = require("mongoose");
const progress_schema_1 = require("../schemas/progress.schema");
exports.ProgressModel = (0, mongoose_1.model)("Progress", progress_schema_1.ProgressSchema);
