"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nameSchema = void 0;
const zod_1 = require("zod");
exports.nameSchema = zod_1.z
    .string()
    .min(1, { message: "Name must be at least 2 characters long" })
    .regex(/^[a-zA-Z]+$/, {
    message: "Name must contain only alphabetic characters",
});
