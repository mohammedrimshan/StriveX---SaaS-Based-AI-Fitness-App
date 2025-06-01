import { z } from "zod";

export const profileFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { message: "First name is required" })
    .regex(/^[A-Za-z\s'-]+$/, {
      message: "First name can only contain letters, spaces, hyphens, and apostrophes",
    })
    .max(50, { message: "First name cannot exceed 50 characters" }),

  lastName: z
    .string()
    .trim()
    .min(1, { message: "Last name is required" })
    .regex(/^[A-Za-z\s'-]+$/, {
      message: "Last name can only contain letters, spaces, hyphens, and apostrophes",
    })
    .max(50, { message: "Last name cannot exceed 50 characters" }),

  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" })
    .max(100, { message: "Email address is too long" })
    .refine(
      (email) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
      },
      { message: "Please enter a valid email address" }
    ),

  phoneNumber: z
    .string()
    .trim()
    .optional()
    .refine(
      (phone) => {
        if (!phone) return true;
        const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
        return phoneRegex.test(phone);
      },
      { message: "Invalid phone number format" }
    )
    .transform((phone) => phone || undefined),

  profileImage: z.string().optional(),

  height: z
    .number({ invalid_type_error: "Height must be a number" })
    .min(50, { message: "Height must be at least 50 cm" })
    .max(250, { message: "Height cannot exceed 250 cm" })
    .optional(),

  weight: z
    .number({ invalid_type_error: "Weight must be a number" })
    .min(10, { message: "Weight must be at least 10 kg" })
    .max(300, { message: "Weight cannot exceed 300 kg" })
    .optional(),

  fitnessGoal: z
    .enum(["weightLoss", "muscleGain", "endurance", "flexibility", "maintenance"], {
      errorMap: () => ({ message: "Invalid fitness goal" }),
    })
    .optional(),

  experienceLevel: z
    .enum(["beginner", "intermediate", "advanced", "expert"], {
      errorMap: () => ({ message: "Invalid experience level" }),
    })
    .optional(),

  preferredWorkout: z
    .enum(["Cardio", "Meditation", "Pilates", "Yoga", "Calisthenics"], {
      errorMap: () => ({ message: "Invalid workout type" }),
    })
    .optional(),

  dietPreference: z
    .enum([
      "balanced",
      "vegetarian",
      "vegan",
      "pescatarian",
      "highProtein",
      "lowCarb",
      "lowFat",
      "glutenFree",
      "dairyFree",
      "sugarFree",
      "keto",
      "noPreference",
    ])
    .optional(),

  activityLevel: z
    .enum(["sedentary", "light", "moderate", "active", "veryActive"], {
      errorMap: () => ({ message: "Invalid activity level" }),
    })
    .optional(),

  healthConditions: z.array(z.string()).optional(),
  additionalHealthCases: z.string().optional(),
  waterIntake: z
    .number({ invalid_type_error: "Water intake must be a number" })
    .min(0, { message: "Water intake cannot be negative" })
    .max(10000, { message: "Water intake is unrealistically high" })
    .optional(),
    waterIntakeTarget: z.number().min(0, "Target water intake cannot be negative").max(8000, "Target water intake cannot exceed 8L").optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const healthConditionsList = [
  { id: "hypertension", label: "Hypertension" },
  { id: "asthma", label: "Asthma" },
  { id: "diabetes", label: "Diabetes" },
  { id: "arthritis", label: "Arthritis" },
  { id: "heartDisease", label: "Heart Disease" },
  { id: "backPain", label: "Chronic Back Pain" },
  { id: "thyroid", label: "Thyroid Condition" },
  { id: "none", label: "None of the above" },
];