"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getWorkoutById, updateWorkout } from "@/services/admin/adminService";
import { Workout } from "@/types/Workouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Loader2,
  Upload,
  Trash2,
  Info,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import ImageCropDialog from "../WorkoutAdd/ImageCropDialog";
import AnimatedTitle from "@/components/Animation/AnimatedTitle";
import AnimatedBackground from "@/components/Animation/AnimatedBackgorund";
import * as Yup from "yup";
import { workoutSchemaUpdate } from "@/utils/validations/workout.validator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WorkoutResponse {
  data: {
    title: string;
    description: string;
    duration: number;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    imageUrl?: string | undefined;
    isPremium: boolean;
    status: boolean;
    [key: string]: any;
  };
}

interface ValidationErrors {
  [key: string]: string;
}

const uploadToCloudinary = async (
  file: File,
  folder: string,
  resourceType: "image" | "video"
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "edusphere");
  formData.append("folder", folder);

  try {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "strivex";
    console.log("Uploading to Cloudinary:", file.name, file.size);
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    if (!response.data.secure_url) {
      throw new Error("No secure_url in Cloudinary response");
    }
    console.log("Cloudinary response:", response.data.secure_url);
    return response.data.secure_url;
  } catch (error: any) {
    console.error(
      "Cloudinary upload error:",
      error.response?.data || error.message
    );
    throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
  }
};

const WorkoutFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Workout>>({
    title: "",
    description: "",
    duration: 30,
    difficulty: "Beginner",
    imageUrl: "",
    isPremium: false,
    status: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      getWorkoutById(id)
        .then((response: WorkoutResponse) => {
          const workout = response.data;
          if (workout) {
            setFormData({
              title: workout.title,
              description: workout.description,
              duration: workout.duration,
              difficulty: workout.difficulty,
              imageUrl: workout.imageUrl || "",
              isPremium: workout.isPremium,
              status: workout.status,
            });
          }
        })
        .catch((error) => {
          toast.error("Failed to load workout data");
          console.error("Error fetching workout:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id]);

  // Validate a specific field
  const validateField = async (name: string, value: any) => {
    try {
      const fieldSchema = Yup.reach(workoutSchemaUpdate, name);
      if (fieldSchema instanceof Yup.Schema) {
        await fieldSchema.validate(value);
        setErrors((prev) => ({ ...prev, [name]: "" }));
        return true;
      } else {
        throw new Error("Invalid schema");
      }
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        setErrors((prev) => ({ ...prev, [name]: error.message }));
        return false;
      }
      return true;
    }
  };

  // Validate the entire form
  const validateForm = async () => {
    try {
      await workoutSchemaUpdate.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors: ValidationErrors = {};
        error.inner.forEach((err) => {
          if (err.path) {
            validationErrors[err.path] = err.message;
          }
        });
        setErrors(validationErrors);
      }
      return false;
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Mark field as touched
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Validate field
    validateField(name, value);
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numberValue = parseInt(value) || 0;
    setFormData((prev) => ({ ...prev, [name]: numberValue }));

    // Mark field as touched
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Validate field
    validateField(name, numberValue);
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, checked);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      console.log("Image loaded for cropping");
      setImageSrc(reader.result as string);
      setIsCropperOpen(true);
    });
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedFile: File) => {
    console.log("Cropped file received:", croppedFile.name, croppedFile.size);
    setIsCropperOpen(false);
    setIsUploading(true);

    try {
      const imageUrl = await uploadToCloudinary(
        croppedFile,
        "workouts",
        "image"
      );
      console.log("Setting imageUrl in formData:", imageUrl);
      setFormData((prev) => {
        const newData = { ...prev, imageUrl };
        console.log("Updated formData:", newData);
        return newData;
      });
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
      setImageSrc(null);
    }
  };

  const handleCropCancel = () => {
    console.log("Crop cancelled");
    setIsCropperOpen(false);
    setImageSrc(null);
  };

  const handleRemoveImage = () => {
    console.log("Removing image from formData");
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) {
      console.log("No workout ID provided");
      return;
    }

    // Mark all fields as touched for validation
    const allFields = Object.keys(formData);
    const touchedFields = allFields.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(touchedFields);

    // Validate all fields
    const isValid = await validateForm();
    if (!isValid) {
      toast.error("Please fix the validation errors");
      return;
    }

    console.log("Submitting form data:", formData);
    setIsSaving(true);

    try {
      await updateWorkout(id, formData);
      toast.success("Workout updated successfully!");
      navigate("/admin/workouts");
    } catch (error) {
      console.error("Error updating workout:", error);
      toast.error("Failed to update workout");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AnimatedBackground>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center mb-6"
        >
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="mr-4 hover:bg-purple-50 hover:text-purple-700 transition-all duration-300"
          >
            <Link to="/admin/workouts">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </motion.div>

        <AnimatedTitle
          title="Edit Workout"
          subtitle="Update your workout details and make it perfect for your users"
        />

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
                {/* Left side - Form fields */}
                <div className="md:col-span-3 p-8">
                  <motion.div
                    className="space-y-6"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <div className="space-y-2">
                      <Label
                        htmlFor="title"
                        className="text-base font-medium text-gray-700 flex items-center"
                      >
                        Title
                        {touched.title && errors.title && (
                          <span className="ml-2 text-red-500 text-xs flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {errors.title}
                          </span>
                        )}
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        required
                        className={`border-purple-100 focus:border-purple-300 focus:ring-purple-200 transition-all duration-300 ${
                          touched.title && errors.title
                            ? "border-red-300 focus:ring-red-200"
                            : ""
                        }`}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="description"
                        className="text-base font-medium text-gray-700 flex items-center"
                      >
                        Description
                        {touched.description && errors.description && (
                          <span className="ml-2 text-red-500 text-xs flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {errors.description}
                          </span>
                        )}
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        rows={4}
                        required
                        className={`border-purple-100 focus:border-purple-300 focus:ring-purple-200 transition-all duration-300 ${
                          touched.description && errors.description
                            ? "border-red-300 focus:ring-red-200"
                            : ""
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="duration"
                          className="text-base font-medium text-gray-700 flex items-center"
                        >
                          Duration (minutes)
                          {touched.duration && errors.duration && (
                            <span className="ml-2 text-red-500 text-xs flex items-center">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {errors.duration}
                            </span>
                          )}
                        </Label>
                        <Input
                          id="duration"
                          name="duration"
                          type="number"
                          min={1}
                          value={formData.duration}
                          onChange={handleNumberChange}
                          onBlur={handleBlur}
                          required
                          className={`border-purple-100 focus:border-purple-300 focus:ring-purple-200 transition-all duration-300 ${
                            touched.duration && errors.duration
                              ? "border-red-300 focus:ring-red-200"
                              : ""
                          }`}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="difficulty"
                          className="text-base font-medium text-gray-700 flex items-center"
                        >
                          Difficulty
                          {touched.difficulty && errors.difficulty && (
                            <span className="ml-2 text-red-500 text-xs flex items-center">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {errors.difficulty}
                            </span>
                          )}
                        </Label>
                        <Select
                          value={formData.difficulty}
                          onValueChange={(value) =>
                            handleSelectChange("difficulty", value)
                          }
                        >
                          <SelectTrigger
                            className={`border-purple-100 focus:ring-purple-200 transition-all duration-300 ${
                              touched.difficulty && errors.difficulty
                                ? "border-red-300 focus:ring-red-200"
                                : ""
                            }`}
                          >
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Beginner">
                              <div className="flex items-center">
                                <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
                                Beginner
                              </div>
                            </SelectItem>
                            <SelectItem value="Intermediate">
                              <div className="flex items-center">
                                <div className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></div>
                                Intermediate
                              </div>
                            </SelectItem>
                            <SelectItem value="Advanced">
                              <div className="flex items-center">
                                <div className="w-2 h-2 rounded-full bg-red-400 mr-2"></div>
                                Advanced
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4 p-6 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 shadow-sm border border-purple-100/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Label
                            htmlFor="isPremium"
                            className="text-base font-medium text-gray-700"
                          >
                            Premium Workout
                          </Label>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-purple-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              Premium workouts are only available to subscribers
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Switch
                          id="isPremium"
                          checked={formData.isPremium}
                          onCheckedChange={(checked) =>
                            handleSwitchChange("isPremium", checked)
                          }
                          className="data-[state=checked]:bg-purple-600"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Label
                            htmlFor="status"
                            className="text-base font-medium text-gray-700"
                          >
                            Active
                          </Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-purple-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              Inactive workouts won't be visible to users
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Switch
                          id="status"
                          checked={formData.status}
                          onCheckedChange={(checked) =>
                            handleSwitchChange("status", checked)
                          }
                          className="data-[state=checked]:bg-purple-600"
                        />
                      </div>

                      <div className="mt-4 pt-4 border-t border-purple-100">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-0.5">
                            <Info className="h-5 w-5 text-purple-500" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-purple-600">
                              {formData.status
                                ? "This workout is currently active and visible to users."
                                : "This workout is currently inactive and hidden from users."}
                            </p>
                            <p className="text-sm text-purple-600 mt-1">
                              {formData.isPremium
                                ? "This is a premium workout, available only to subscribed users."
                                : "This is a free workout, available to all users."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Right side - Image upload and preview */}
                <motion.div
                  className="md:col-span-2 relative"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <div className="h-full flex flex-col">
                    {/* Gradient overlay on the image section */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-indigo-600/20 pointer-events-none"></div>

                    <div className="flex-1 flex flex-col p-8 relative">
                      <h3 className="text-lg font-medium text-purple-800 mb-6 flex items-center">
                        <ImageIcon className="mr-2 h-5 w-5" />
                        Workout Image
                      </h3>

                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />

                      <div className="flex justify-center gap-3 mb-6">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            type="button"
                            onClick={handleImageClick}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all duration-300"
                            disabled={isUploading}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Image
                          </Button>
                        </motion.div>
                        {formData.imageUrl && (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleRemoveImage}
                              className="border-red-300 text-red-600 hover:bg-red-50 transition-all duration-300"
                              disabled={isUploading}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </Button>
                          </motion.div>
                        )}
                      </div>

                      <div className="flex-1 flex items-center justify-center">
                        <motion.div
                          className="w-full h-64 md:h-auto rounded-xl overflow-hidden shadow-xl border-2 border-white/80 group relative"
                          whileHover={{
                            boxShadow:
                              "0 20px 25px -5px rgba(168, 85, 247, 0.3)",
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {isUploading ? (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-purple-50 to-indigo-50">
                              <div className="flex flex-col items-center">
                                <Loader2 className="h-10 w-10 animate-spin text-purple-500 mb-3" />
                                <p className="text-sm text-purple-600">
                                  Uploading to cloud storage...
                                </p>
                              </div>
                            </div>
                          ) : formData.imageUrl ? (
                            <div className="relative h-full">
                              <img
                                src={formData.imageUrl}
                                alt="Workout"
                                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={handleImageClick}
                                  className="bg-white/90 hover:bg-white text-purple-700 hover:text-purple-800 transition-all duration-300 shadow-lg"
                                >
                                  <Upload className="mr-2 h-4 w-4" />
                                  Change Image
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div
                              className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-r from-purple-50 to-indigo-50 cursor-pointer p-6"
                              onClick={handleImageClick}
                            >
                              <div className="text-center p-6 bg-white/60 rounded-xl backdrop-blur-sm shadow-lg border border-purple-100">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
                                  <Upload className="h-8 w-8 text-purple-500" />
                                </div>
                                <h4 className="font-medium text-purple-700 mb-2">
                                  Upload Workout Image
                                </h4>
                                <p className="text-sm text-purple-500">
                                  Click to select an image file
                                </p>
                                <p className="text-xs text-purple-400 mt-2">
                                  Recommended: 16:9 ratio
                                  <br />
                                  Maximum size: 10MB
                                </p>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      </div>

                      {formData.imageUrl && (
                        <div className="mt-4 text-center">
                          <p className="text-xs text-purple-500 bg-purple-50 py-2 px-3 rounded-full inline-flex items-center">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Image ready for upload
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            <motion.div
              className="flex gap-4 justify-end"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Button
                variant="outline"
                type="button"
                asChild
                className="border-purple-200 hover:bg-purple-50 hover:text-purple-700 h-11 px-6"
              >
                <Link to="/admin/workouts">Cancel</Link>
              </Button>

              {isSaving ? (
                <Button
                  disabled
                  className="min-w-[150px] h-11 bg-gradient-to-r from-purple-600 to-indigo-600"
                >
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="min-w-[150px] h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center"
                >
                  <motion.div
                    className="flex items-center"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.3 }}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Update Workout
                  </motion.div>
                </Button>
              )}
            </motion.div>
          </form>
        </motion.div>
      </div>

      {/* Enhanced Image Crop Dialog */}
      <ImageCropDialog
        isOpen={isCropperOpen}
        uploadedImage={imageSrc}
        onClose={handleCropCancel}
        onCrop={handleCropComplete}
        aspectRatio={16 / 9}
        maxWidth={1200}
        dialogTitle="Crop Workout Image"
        dialogDescription="Adjust and crop your image for the perfect fit. An aspect ratio of 16:9 is recommended for best results."
        cancelButtonText="Cancel"
        confirmButtonText="Apply Crop"
        modalSize="lg"
        overlayClassName="bg-purple-900/40 backdrop-blur-sm"
        className="bg-white rounded-2xl shadow-2xl border border-purple-100"
      />
    </AnimatedBackground>
  );
};

export default WorkoutFormPage;
