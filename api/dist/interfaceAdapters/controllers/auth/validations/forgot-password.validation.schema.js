"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPasswordValidationSchema = void 0;
const constants_1 = require("@/shared/constants");
const email_validation_1 = require("@/shared/validations/email.validation");
const zod_1 = require("zod");
exports.forgotPasswordValidationSchema = zod_1.z.object({
    email: email_validation_1.strongEmailRegex,
    role: zod_1.z.enum(["client", "admin", "trainer"], {
        message: constants_1.ERROR_MESSAGES.INVALID_ROLE,
    }),
});
