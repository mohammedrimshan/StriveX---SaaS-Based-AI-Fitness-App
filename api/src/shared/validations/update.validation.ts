
import { z } from "zod";

 // Validation schema
 export const trainerUpdateSchema = z.object({
    firstName: z.string().min(1, "First name is required").optional(),
    lastName: z.string().min(1, "Last name is required").optional(),
    phoneNumber: z.string().min(10, "Invalid phone number").optional(),
    profileImage: z.string().optional(),
    height: z.number().min(0, "Height must be positive").optional(),
    weight: z.number().min(0, "Weight must be positive").optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    experience: z.number().min(0, "Experience cannot be negative").optional(),
    skills: z.array(z.string()).optional(),
    qualifications: z.array(z.string()).optional(),
    specialization: z.array(z.string()).optional(),
    certifications: z.array(z.string()).optional(),
  });