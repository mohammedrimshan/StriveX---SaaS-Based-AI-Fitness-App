import { z } from "zod";

import { strongEmailRegex } from "../../../../shared/validations/email.validation";
import { passwordSchema } from "../../../../shared/validations/password.validation";
import { nameSchema } from "../../../../shared/validations/name.validation";
import { phoneNumberSchema } from "../../../../shared/validations/phone.validation";
import client from "@/frameworks/cache/redis.client";


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


const trainerSchema = z.object({
  name: nameSchema, 
  email: strongEmailRegex, 
  phone: phoneNumberSchema, 
  password: passwordSchema, 
  experience: z.number().int().min(0).max(50), 
  skills: z.array(z.string().min(1)).min(1), 
  role: z.literal("trainer"), 
});


export const userSchemas = {
  admin: adminSchema,
  client: userSchema,
  trainer: trainerSchema,
};