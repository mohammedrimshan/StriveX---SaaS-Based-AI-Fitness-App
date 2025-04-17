import { z } from "zod";
import { config } from "../config";
export const createStripeConnectAccountSchema = z.object({
  refreshUrl: z.string().url().optional().default(`${config.cors.ALLOWED_ORIGIN}/trainer/onboarding/refresh`),
  returnUrl: z.string().url().optional().default(`${config.cors.ALLOWED_ORIGIN}/trainer/onboarding/complete`),
});