"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpMailValidationSchema = void 0;
const zod_1 = require("zod");
const email_validation_1 = require("../../../../shared/validations/email.validation");
exports.otpMailValidationSchema = zod_1.z.object({
    email: email_validation_1.strongEmailRegex,
    otp: zod_1.z
        .string()
        .length(4, "OTP must be exactly 4 digits")
        .regex(/^\d{4}$/, "OTP must contain only numbers"),
});
