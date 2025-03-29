// src/validations/trainerProfileValidation.ts
import * as Yup from "yup";

export const trainerProfileSchema = Yup.object({
  firstName: Yup.string()
    .min(2, "First name must be at least 2 characters")
    .required("First name is required"),
  lastName: Yup.string()
    .min(2, "Last name must be at least 2 characters")
    .required("Last name is required"),
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  phoneNumber: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  experience: Yup.number()
    .min(0, "Experience cannot be negative")
    .required("Experience is required"),
  height: Yup.number()
    .min(50, "Height must be at least 50 cm")
    .required("Height is required"),
  weight: Yup.number()
    .min(20, "Weight must be at least 20 kg")
    .required("Weight is required"),
  specialization: Yup.array()
    .min(1, "Please select at least one specialization")
    .required("Specialization is required"),
});