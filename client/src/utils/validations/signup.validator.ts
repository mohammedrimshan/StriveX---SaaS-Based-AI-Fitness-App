import * as Yup from "yup";

const isAtLeast18YearsOld = (birthDate: Date): boolean => {
  if (!birthDate) return false;
  const today = new Date();
  const eighteenYearsAgo = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate()
  );
  return birthDate <= eighteenYearsAgo;
};

// Basic info validation (Step 1) - for both client and trainer
export const basicInfoSchema = Yup.object().shape({
  firstName: Yup.string()
    .matches(/^[a-zA-Z]+$/, "First name should only contain letters")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters")
    .required("First name is required"),
  lastName: Yup.string()
    .matches(/^[a-zA-Z]+$/, "Last name should only contain letters")
    .min(1, "Last name must be at least 1 character")
    .max(50, "Last name must not exceed 50 characters")
    .required("Last name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  phoneNumber: Yup.string()
    .matches(/^\+?[1-9]\d{9}$/, "Invalid phone number")
    .required("Contact number is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character"
    )
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password") as unknown as string], "Passwords must match")
    .required("Confirm Password is required"),
});

// Trainer personal info validation (Step 2)
export const trainerPersonalInfoSchema = Yup.object().shape({
  dateOfBirth: Yup.date()
    .required("Date of birth is required")
    .test(
      "is-at-least-18",
      "You must be at least 18 years old to register as a trainer",
      function (value) {
        return isAtLeast18YearsOld(new Date(value));
      }
    ),
  experience: Yup.number()
    .typeError("Experience must be a number")
    .min(0, "Experience cannot be negative")
    .max(50, "Experience must not exceed 50 years")
    .required("Experience is required"),
  gender: Yup.string()
    .oneOf(["male", "female", "other"], "Please select a valid gender")
    .required("Gender is required"),
});

// Trainer skills validation (Step 3)
export const trainerSkillsSchema = Yup.object().shape({
  skills: Yup.array()
    .of(Yup.string())
    .min(1, "Please select at least one skill")
    .required("Skills are required"),
});

// Get the appropriate validation schema based on user type and current step
export const getValidationSchema = (userType: string, currentStep: number) => {
  // For client, only use basic info validation
  if (userType === "client") {
    return basicInfoSchema;
  }

  // For trainer, use different validation schemas based on current step
  if (userType === "trainer") {
    switch (currentStep) {
      case 1:
        return basicInfoSchema;
      case 2:
        return trainerPersonalInfoSchema;
      case 3:
        return trainerSkillsSchema;
      default:
        return basicInfoSchema;
    }
  }

  // Default fallback
  return basicInfoSchema;
};

// Complete validation schema (all fields) - used for final validation
export const signupSchema = Yup.object().shape({
  // Basic info fields
  ...basicInfoSchema.fields,
  
  // Conditional fields for trainers
  dateOfBirth: Yup.date()
    .when('$userType', {
      is: 'trainer',
      then: () => Yup.date()
        .required("Date of birth is required")
        .test(
          "is-at-least-18",
          "You must be at least 18 years old to register as a trainer",
          function (value) {
            if (!value) return false;
            return isAtLeast18YearsOld(new Date(value));
          }
        ),
      otherwise: () => Yup.date().notRequired(),
    }),
  
  experience: Yup.number()
    .when('$userType', {
      is: 'trainer',
      then: () => Yup.number()
        .typeError("Experience must be a number")
        .min(0, "Experience cannot be negative")
        .max(50, "Experience must not exceed 50 years")
        .required("Experience is required"),
      otherwise: () => Yup.number().notRequired(),
    }),
  
  gender: Yup.string()
    .when('$userType', {
      is: 'trainer',
      then: () => Yup.string()
        .oneOf(["male", "female", "other"], "Please select a valid gender")
        .required("Gender is required"),
      otherwise: () => Yup.string().notRequired(),
    }),
  
  skills: Yup.array()
    .when('$userType', {
      is: 'trainer',
      then: () => Yup.array()
        .of(Yup.string())
        .min(1, "Please select at least one skill")
        .required("Skills are required"),
      otherwise: () => Yup.array().notRequired(),
    }),
});