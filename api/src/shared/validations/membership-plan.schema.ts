import { z } from "zod";

export const createMembershipPlanSchema = z.object({
  name: z.string().min(1, "Name is required"),
  durationMonths: z.number().int().positive("Duration must be a positive integer"),
  price: z.number().positive("Price must be a positive number"),
  isActive: z.boolean().optional().default(true),
});

export const updateMembershipPlanSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  durationMonths: z.number().int().positive("Duration must be a positive integer").optional(),
  price: z.number().positive("Price must be a positive number").optional(),
  isActive: z.boolean().optional(),
});