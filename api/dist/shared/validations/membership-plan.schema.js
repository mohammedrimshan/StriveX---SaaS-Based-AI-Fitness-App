"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMembershipPlanSchema = exports.createMembershipPlanSchema = void 0;
const zod_1 = require("zod");
exports.createMembershipPlanSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    durationMonths: zod_1.z.number().int().positive("Duration must be a positive integer"),
    price: zod_1.z.number().positive("Price must be a positive number"),
    isActive: zod_1.z.boolean().optional().default(true),
});
exports.updateMembershipPlanSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required").optional(),
    durationMonths: zod_1.z.number().int().positive("Duration must be a positive integer").optional(),
    price: zod_1.z.number().positive("Price must be a positive number").optional(),
    isActive: zod_1.z.boolean().optional(),
});
