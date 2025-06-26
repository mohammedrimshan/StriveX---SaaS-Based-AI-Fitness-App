"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchemas = exports.postRegisterValidationSchema = exports.trainerSchema = exports.GenderEnum = void 0;
const zod_1 = require("zod");
const email_validation_1 = require("../../../../shared/validations/email.validation");
const password_validation_1 = require("../../../../shared/validations/password.validation");
const name_validation_1 = require("../../../../shared/validations/name.validation");
const phone_validation_1 = require("../../../../shared/validations/phone.validation");
exports.GenderEnum = zod_1.z.enum(["male", "female", "other"]);
const adminSchema = zod_1.z.object({
    firstName: name_validation_1.nameSchema,
    lastName: name_validation_1.nameSchema,
    email: email_validation_1.strongEmailRegex,
    password: password_validation_1.passwordSchema,
    role: zod_1.z.literal("admin"),
});
const userSchema = zod_1.z.object({
    firstName: name_validation_1.nameSchema,
    lastName: name_validation_1.nameSchema,
    email: email_validation_1.strongEmailRegex,
    phoneNumber: phone_validation_1.phoneNumberSchema,
    password: password_validation_1.passwordSchema,
    confirmPassword: password_validation_1.passwordSchema,
    role: zod_1.z.literal("client"),
});
exports.trainerSchema = zod_1.z.object({
    firstName: name_validation_1.nameSchema,
    lastName: name_validation_1.nameSchema,
    email: email_validation_1.strongEmailRegex,
    phoneNumber: phone_validation_1.phoneNumberSchema,
    password: password_validation_1.passwordSchema,
    role: zod_1.z.literal("trainer"),
    dateOfBirth: zod_1.z.string().regex(/^\d{2}-\d{2}-\d{4}$/, "Invalid date format (DD-MM-YYYY)").optional(),
    gender: exports.GenderEnum.optional(),
    experience: zod_1.z.number().int().min(0).max(50).optional(),
    skills: zod_1.z.array(zod_1.z.string().min(1)).min(1).optional(),
    qualifications: zod_1.z.array(zod_1.z.string().min(1)).optional(),
    specialization: zod_1.z.array(zod_1.z.string().min(1)).optional(),
    certifications: zod_1.z.array(zod_1.z.string().min(1)).optional(),
    approvedByAdmin: zod_1.z.boolean().optional(),
    approvalStatus: zod_1.z.enum(["pending", "approved", "rejected"]).default("pending"),
});
exports.postRegisterValidationSchema = exports.trainerSchema.pick({
    dateOfBirth: true,
    gender: true,
    experience: true,
    skills: true
});
exports.userSchemas = {
    admin: adminSchema,
    client: userSchema,
    trainer: exports.trainerSchema,
};
