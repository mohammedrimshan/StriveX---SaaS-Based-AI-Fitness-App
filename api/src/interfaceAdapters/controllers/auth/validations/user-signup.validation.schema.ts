import { z } from "zod";

import { strongEmailRegex } from "../../../../shared/validations/email.validation";
import { passwordSchema } from "../../../../shared/validations/password.validation";
import { nameSchema } from "../../../../shared/validations/name.validation";
import { phoneNumberSchema } from "../../../../shared/validations/phone.validation";
import client from "@/frameworks/cache/redis.client";




export const GenderEnum = z.enum(["male", "female", "other"]);


const adminSchema = z.object({
  firstName: nameSchema, 
  lastName: nameSchema,
  email: strongEmailRegex, 
  password: passwordSchema, 
  role: z.literal("admin"), 
});


const userSchema = z.object({
  firstName: nameSchema, 
  lastName: nameSchema,
  email: strongEmailRegex, 
  phoneNumber: phoneNumberSchema, 
  password: passwordSchema, 
  confirmPassword: passwordSchema,
  role: z.literal("client"), 
});


export const trainerSchema = z.object({
  firstName: nameSchema, 
  lastName: nameSchema,
  email: strongEmailRegex, 
  phoneNumber: phoneNumberSchema, 
  password: passwordSchema, 
  role: z.literal("trainer"), 
  dateOfBirth: z.string().regex(/^\d{2}-\d{2}-\d{4}$/, "Invalid date format (DD-MM-YYYY)").optional(),
  gender: GenderEnum.optional(),
  experience: z.number().int().min(0).max(50).optional(),
  skills: z.array(z.string().min(1)).min(1).optional(),
  qualifications: z.array(z.string().min(1)).optional(),
  specialization: z.array(z.string().min(1)).optional(),
  certifications: z.array(z.string().min(1)).optional(),
  approvedByAdmin: z.boolean().optional(),
  approvalStatus: z.enum(["pending", "approved", "rejected"]).default("pending"),
});


export const postRegisterValidationSchema = trainerSchema.pick({
  dateOfBirth: true,
  gender: true,
  experience: true,
  skills: true
});


export const userSchemas = {
  admin: adminSchema,
  client: userSchema,
  trainer: trainerSchema,
};