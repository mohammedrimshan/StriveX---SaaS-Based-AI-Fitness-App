"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strongEmailRegex = void 0;
const zod_1 = require("zod");
exports.strongEmailRegex = zod_1.z
    .string()
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: "Invalid email format",
});
