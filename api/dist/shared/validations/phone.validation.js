"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.phoneNumberSchema = void 0;
const zod_1 = require("zod");
exports.phoneNumberSchema = zod_1.z
    .string()
    .length(10, { message: "Phone number must be exactly 10 digits" })
    .regex(/^\d{10}$/, { message: "Phone number must contain only digits" });
