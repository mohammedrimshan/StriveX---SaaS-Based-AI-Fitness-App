"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCheckoutSessionSchema = void 0;
const zod_1 = require("zod");
exports.createCheckoutSessionSchema = zod_1.z.object({
    planId: zod_1.z.string().min(1, "Plan ID is required"),
    successUrl: zod_1.z.string().url().optional().default(`${process.env.FRONTEND_URL}/payment/success`),
    cancelUrl: zod_1.z.string().url().optional().default(`${process.env.FRONTEND_URL}/payment/cancel`),
    useWalletBalance: zod_1.z.boolean().optional().default(false)
});
