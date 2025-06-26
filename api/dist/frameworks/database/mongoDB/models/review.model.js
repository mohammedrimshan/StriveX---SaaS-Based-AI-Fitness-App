"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewModel = void 0;
const review_schema_1 = require("../schemas/review.schema");
const mongoose_1 = require("mongoose");
exports.ReviewModel = (0, mongoose_1.model)("Review", review_schema_1.reviewSchema);
