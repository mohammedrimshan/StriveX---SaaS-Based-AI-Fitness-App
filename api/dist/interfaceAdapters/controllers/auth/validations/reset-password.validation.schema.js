"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordValidationSchema = void 0;
const constants_1 = require("@/shared/constants");
const password_validation_1 = require("@/shared/validations/password.validation");
const zod_1 = require("zod");
exports.resetPasswordValidationSchema = zod_1.z.object({
    password: password_validation_1.passwordSchema,
    token: zod_1.z.string(),
    role: zod_1.z.enum(["client", "admin", "trainer"], {
        message: constants_1.ERROR_MESSAGES.INVALID_ROLE,
    }),
});
