import * as Yup from "yup";

export const workoutSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters")
    .required("Workout title is required"),
  description: Yup.string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description cannot exceed 1000 characters")
    .required("Workout description is required"),
  category: Yup.string().required("Category is required"),
  difficulty: Yup.string()
    .oneOf(["Beginner", "Intermediate", "Advanced"], "Invalid difficulty level")
    .required("Difficulty level is required"),
  exercises: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string()
          .min(3, "Exercise name must be at least 3 characters")
          .max(100, "Exercise name cannot exceed 100 characters")
          .required("Exercise name is required"),
        description: Yup.string()
          .min(10, "Exercise description must be at least 10 characters")
          .max(500, "Exercise description cannot exceed 500 characters")
          .required("Exercise description is required"),
        duration: Yup.number()
          .min(1, "Duration must be at least 1 minute")
          .required("Duration is required"),
        defaultRestDuration: Yup.number()
          .min(0, "Rest duration cannot be negative")
          .required("Rest duration is required"),
      })
    )
    .min(1, "At least one exercise is required")
    .required("Exercises are required"),
  isPremium: Yup.boolean().required(),
  status: Yup.boolean().required(),
  imageUrl: Yup.string()
    .optional()
    .test(
      "image-format",
      "Image must be in JPEG,12, PNG, or WebP format",
      (value) => {
        if (!value) return true;
        return (
          value.startsWith("data:image/jpeg") ||
          value.startsWith("data:image/png") ||
          value.startsWith("data:image/webp")
        );
      }
    )
    .test(
      "image-size",
      "Image size must not exceed 5MB",
      (value) => {
        if (!value) return true;
        const base64Size = (value.length * 3) / 4 - (value.indexOf("=") > 0 ? (value.length - value.indexOf("=")) : 0);
        return base64Size <= 5 * 1024 * 1024; // 5MB in bytes
      }
    ),
});

export const workoutSchemaUpdate = Yup.object().shape({
  title: Yup.string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters")
    .required("Workout title is required")
    .matches(/^[a-zA-Z0-9\s.,'-]+$/, "Title cannot contain special characters")
    .test("not-only-whitespace", "Title cannot be empty or just spaces", (value) => value?.trim().length > 0),
  description: Yup.string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description cannot exceed 1000 characters")
    .required("Workout description is required")
    .test("not-only-whitespace", "Description cannot be empty or just spaces", (value) => value?.trim().length > 0),
  difficulty: Yup.string()
    .oneOf(["Beginner", "Intermediate", "Advanced"], "Invalid difficulty level")
    .required("Difficulty level is required"),
  duration: Yup.number()
    .min(1, "Duration must be at least 1 minute")
    .required("Duration is required"),
  isPremium: Yup.boolean().required(),
  status: Yup.boolean().required(),
  imageUrl: Yup.string().optional(),
});

export const exerciseSchema = (isEditMode: boolean) =>
  Yup.object().shape({
    name: Yup.string()
      .trim()
      .min(3, "Exercise name must be at least 3 characters")
      .max(100, "Exercise name cannot exceed 100 characters")
      .required("Exercise name is required")
      .matches(/^[a-zA-Z0-9\s.,'-]+$/, "Exercise name cannot contain special characters")
      .test("not-only-whitespace", "Exercise name cannot be empty or just spaces", (value) => value?.trim().length > 0),
    description: Yup.string()
      .trim()
      .min(10, "Description must be at least 10 characters")
      .max(500, "Description cannot exceed 500 characters")
      .required("Exercise description is required")
      .test("not-only-whitespace", "Description cannot be empty or just spaces", (value) => value?.trim().length > 0),
    duration: Yup.number()
      .min(1, "Duration must be at least 1 second")
      .required("Duration is required")
      .typeError("Duration must be a number"),
    defaultRestDuration: Yup.number()
      .min(0, "Rest duration cannot be negative")
      .required("Rest duration is required")
      .typeError("Rest duration must be a number"),
    videoFile: isEditMode
      ? Yup.mixed<File>()
          .nullable()
          .optional()
          .test("file-size", "Video size must not exceed 100MB", (value) => !value || value.size <= 100 * 1024 * 1024)
          .test(
            "file-type",
            "Video must be in MP4, MOV, or WebM format",
            (value) => !value || ["video/mp4", "video/quicktime", "video/webm"].includes(value.type)
          )
      : Yup.mixed<File>()
          .required("A video file is required")
          .test("file-size", "Video size must not exceed 100MB", (value) => !value || value.size <= 100 * 1024 * 1024)
          .test(
            "file-type",
            "Video must be in MP4, MOV, or WebM format",
            (value) => !value || ["video/mp4", "video/quicktime", "video/webm"].includes(value.type)
          ),
  });