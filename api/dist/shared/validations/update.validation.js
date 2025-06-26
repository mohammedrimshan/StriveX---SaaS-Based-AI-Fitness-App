"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trainerUpdateSchema = void 0;
const zod_1 = require("zod");
// Validation schema
exports.trainerUpdateSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1, "First name is required").optional(),
    lastName: zod_1.z.string().min(1, "Last name is required").optional(),
    phoneNumber: zod_1.z.string().min(10, "Invalid phone number").optional(),
    profileImage: zod_1.z.string().optional(),
    height: zod_1.z.number().min(0, "Height must be positive").optional(),
    weight: zod_1.z.number().min(0, "Weight must be positive").optional(),
    dateOfBirth: zod_1.z.string().optional(),
    gender: zod_1.z.enum(["male", "female", "other"]).optional(),
    experience: zod_1.z.number().min(0, "Experience cannot be negative").optional(),
    skills: zod_1.z.array(zod_1.z.string()).optional(),
    qualifications: zod_1.z.array(zod_1.z.string()).optional(),
    specialization: zod_1.z.array(zod_1.z.string()).optional(),
    certifications: zod_1.z.array(zod_1.z.string()).optional(),
});
