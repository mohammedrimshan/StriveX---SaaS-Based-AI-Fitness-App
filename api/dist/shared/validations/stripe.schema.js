"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStripeConnectAccountSchema = void 0;
const zod_1 = require("zod");
const config_1 = require("../config");
exports.createStripeConnectAccountSchema = zod_1.z.object({
    refreshUrl: zod_1.z.string().url().optional().default(`${config_1.config.cors.ALLOWED_ORIGIN}/trainer/onboarding/refresh`),
    returnUrl: zod_1.z.string().url().optional().default(`${config_1.config.cors.ALLOWED_ORIGIN}/trainer/onboarding/complete`),
});
