"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategorySchema = void 0;
const mongoose_1 = require("mongoose");
exports.CategorySchema = new mongoose_1.Schema({
    categoryId: { type: String, required: true, unique: true },
    status: { type: Boolean, default: true },
    title: { type: String, required: true },
    metValue: { type: Number, required: true },
    description: { type: String, required: false },
}, { timestamps: true });
exports.CategorySchema.index({ status: 1 });
