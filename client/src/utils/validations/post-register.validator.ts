// post-register.validator.ts
import * as Yup from "yup"

// Minimum age requirement (e.g., 18 years)
const MIN_AGE_YEARS = 18

// Validation schema for personal information
export const personalInfoSchema = Yup.object({
  profileImage: Yup.string(),
  dateOfBirth: Yup.string()
    .required("Date of birth is required")
    .test("is-adult", `You must be at least ${MIN_AGE_YEARS} years old`, function(value) {
      if (!value) return false
      
      const birthDate = new Date(value)
      const today = new Date()
      
      // Calculate age
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      // Adjust age if birthday hasn't occurred yet this year
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      
      return age >= MIN_AGE_YEARS
    }),
  experience: Yup.number()
    .required("Experience level is required")
    .min(0, "Experience cannot be negative")
    .max(50, "Experience cannot exceed 50 years")
    .integer("Experience must be a whole number"),
  gender: Yup.string()
    .required("Gender is required")
    .oneOf(["male", "female", "non-binary", "prefer-not-to-say"], "Invalid gender selection"),
})

// Validation schema for skills
export const skillsSchema = Yup.object({
  skills: Yup.object({
    nutrition: Yup.boolean(),
    posture: Yup.boolean(),
    mindfulness: Yup.boolean(),
    muscleBuilding: Yup.boolean(),
    strengthTraining: Yup.boolean(),
    weightLoss: Yup.boolean(),
    stressManagement: Yup.boolean(),
    flexibility: Yup.boolean(),
    coreStrengthening: Yup.boolean(),
  }).test(
    "at-least-one-skill", 
    "Please select at least one skill", 
    (skills) => skills ? Object.values(skills).some(value => value === true) : false
  ),
})

// Combined validation schema for the entire form
export const combinedFormSchema = Yup.object({
  ...personalInfoSchema.fields,
  ...skillsSchema.fields,
})

// Helper function to validate a specific step
export const validateStep = async (
  step: "personalInfo" | "skills", 
  values: any
): Promise<Record<string, string>> => {
  try {
    const schema = step === "personalInfo" ? personalInfoSchema : skillsSchema
    await schema.validate(values, { abortEarly: false })
    return {}
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      return error.inner.reduce(
        (errors, err) => ({
          ...errors,
          [err.path || ""]: err.message,
        }),
        {}
      )
    }
    return { form: "Validation failed" }
  }
}