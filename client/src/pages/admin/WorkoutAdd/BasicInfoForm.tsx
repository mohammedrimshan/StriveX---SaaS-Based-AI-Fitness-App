import React, { useEffect } from "react";
import { BookOpen, Crown, Upload, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Workout } from "@/types/Workouts";

import { useFormValidation } from "@/hooks/ui/useFormValidation";
import * as Yup from "yup";
import { CategoryType } from "@/hooks/admin/useAllCategory";

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

// Create a validation schema just for the basic info section
const basicInfoSchema = Yup.object().shape({
  title: Yup.string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters")
    .required("Workout title is required")
    .matches(/^[a-zA-Z0-9\s.,'-]+$/, "Title cannot contain special characters")
    .test("not-only-whitespace", "Title cannot be empty or just spaces", value => value?.trim().length > 0),
  description: Yup.string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description cannot exceed 1000 characters")
    .required("Workout description is required")
    .test("not-only-whitespace", "Description cannot be empty or just spaces", value => value?.trim().length > 0),
  category: Yup.string().required("Category is required"),
  difficulty: Yup.string()
    .oneOf(["Beginner", "Intermediate", "Advanced"], "Invalid difficulty level")
    .required("Difficulty level is required"),
});

interface BasicInfoFormProps {
  workout: Workout;
  categories: CategoryType[];
  croppedImageUrl: string | null;
  onChange: (workout: Workout) => void;
  onImageUpload: (image: string) => void;
  onRemoveImage: () => void;
  onValidationChange?: (isValid: boolean) => void;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  workout,
  categories,
  croppedImageUrl,
  onChange,
  onImageUpload,
  onRemoveImage,
  onValidationChange,
}) => {
  // Use our validation hook
  const { errors, validateField, validateForm, isValid } = useFormValidation(
    basicInfoSchema,
    workout,
    false // don't validate on every change
  );

  // Update the parent component with validation status
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  }, [isValid, onValidationChange]);

  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const updatedWorkout = { ...workout, [name]: value };
    onChange(updatedWorkout);
    
    // Validate the field that just changed
    await validateField(name, value);
  };

  const handleSelectChange = async (name: string, value: string) => {
    const updatedWorkout = { ...workout, [name]: value };
    onChange(updatedWorkout);
    
    // Validate the field that just changed
    await validateField(name, value);
  };

  const handleSwitchChange = (checked: boolean) => {
    onChange({ ...workout, isPremium: checked });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        onImageUpload(reader.result as string);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Validate all fields when the form is first loaded
  useEffect(() => {
    validateForm();
  }, []);

  return (
    <motion.div
      className="space-y-6 form-section"
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
      initial="hidden"
      animate="visible"
    >
      <motion.h2
        className="text-2xl font-bold tracking-tight flex items-center"
        variants={itemVariants}
      >
        <BookOpen className="mr-3 h-6 w-6 text-purple-600" />
        Basic Information
      </motion.h2>
      <motion.div className="grid gap-4" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
        <motion.div className="grid gap-2" variants={itemVariants}>
          <Label htmlFor="title">Workout Title *</Label>
          <Input
            id="title"
            name="title"
            value={workout.title}
            onChange={handleChange}
            placeholder="Enter workout title"
            className={`bg-white/80 backdrop-blur-sm ${
              errors.title ? "border-red-300 focus-visible:ring-red-500" : "border-purple-100 focus-visible:ring-purple-500"
            }`}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.title}
            </p>
          )}
        </motion.div>
        <motion.div className="grid gap-2" variants={itemVariants}>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            name="description"
            value={workout.description}
            onChange={handleChange}
            placeholder="Describe the workout"
            className={`min-h-32 bg-white/80 backdrop-blur-sm ${
              errors.description ? "border-red-300 focus-visible:ring-red-500" : "border-purple-100 focus-visible:ring-purple-500"
            }`}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.description}
            </p>
          )}
        </motion.div>
        <motion.div className="grid gap-2" variants={itemVariants}>
          <Label htmlFor="category">Category *</Label>
          <Select
            value={workout.category}
            onValueChange={(value) => handleSelectChange("category", value)}
          >
            <SelectTrigger className={`bg-white/80 backdrop-blur-sm ${
              errors.category ? "border-red-300 focus-visible:ring-red-500" : "border-purple-100"
            }`}>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category._id} value={category._id} className="text-gray-900">
                  {category.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.category}
            </p>
          )}
        </motion.div>
        <motion.div className="grid gap-2" variants={itemVariants}>
          <Label htmlFor="difficulty">Difficulty Level *</Label>
          <Select
            value={workout.difficulty}
            onValueChange={(value) =>
              handleSelectChange("difficulty", value as "Beginner" | "Intermediate" | "Advanced")
            }
          >
            <SelectTrigger className={`bg-white/80 backdrop-blur-sm ${
              errors.difficulty ? "border-red-300 focus-visible:ring-red-500" : "border-purple-100"
            }`}>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          {errors.difficulty && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.difficulty}
            </p>
          )}
        </motion.div>
        <motion.div className="grid gap-2" variants={itemVariants}>
          <Label>Workout Image</Label>
          <div className="flex flex-col space-y-3">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("image-upload")?.click()}
                className="bg-white/80 border-purple-100 hover:bg-purple-50 hover:text-purple-700"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {croppedImageUrl && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onRemoveImage}
                  className="bg-white/80 border-red-100 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Image
                </Button>
              )}
            </div>
            {croppedImageUrl && (
              <div className="mt-2 relative overflow-hidden rounded-lg border border-purple-100 aspect-video bg-white/50">
                <img
                  src={croppedImageUrl}
                  alt="Workout preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </motion.div>
        <motion.div className="flex items-center space-x-2" variants={itemVariants}>
          <Switch
            id="isPremium"
            checked={workout.isPremium}
            onCheckedChange={handleSwitchChange}
            className="data-[state=checked]:bg-amber-500"
          />
          <Label htmlFor="isPremium" className="flex items-center">
            <Crown className="mr-2 h-4 w-4 text-amber-500" />
            Premium Workout
          </Label>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default BasicInfoForm;