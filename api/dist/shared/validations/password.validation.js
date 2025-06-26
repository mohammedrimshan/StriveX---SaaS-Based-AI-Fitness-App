"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordSchema = void 0;
const zod_1 = require("zod");
exports.passwordSchema = zod_1.z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, {
    message: "Password must contain at least one uppercase letter",
})
    .regex(/[0-9]/, { message: "Password must contain at least one digit" })
    .regex(/[@$!%*?&]/, {
    message: "Password must contain at least one special character",
});
