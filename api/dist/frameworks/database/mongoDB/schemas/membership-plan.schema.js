"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.membershipPlanSchema = void 0;
const mongoose_1 = require("mongoose");
exports.membershipPlanSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    durationMonths: { type: Number, required: true },
    price: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
