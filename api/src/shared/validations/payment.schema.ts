import { z } from "zod";

export const createCheckoutSessionSchema = z.object({
  planId: z.string().min(1, "Plan ID is required"),
  successUrl: z.string().url().optional().default(`${process.env.FRONTEND_URL}/payment/success`),
  cancelUrl: z.string().url().optional().default(`${process.env.FRONTEND_URL}/payment/cancel`),
});