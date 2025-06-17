import React, { useEffect } from "react";
import {
  CheckCircle2,
  Dumbbell,
  Hourglass,
  PlusCircle,
  TimerIcon,
  Trash2,
  Upload,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Exercise } from "@/types/Workouts";
import { useFormValidation } from "@/hooks/ui/useFormValidation";
import { exerciseSchema } from "@/utils/validations/workout.validator";

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

interface ExerciseFormProps {
  currentExercise: Exercise;
  videoPreviewUrl: string | null;
  editingExerciseIndex: number | null;
  onExerciseChange: (exercise: Exercise) => void;
  onVideoUpload: (file: File) => void;
  onRemoveVideo: () => void;
  onAddExercise: () => void;
  onValidationChange?: (isValid: boolean) => void;
  isVideoUploading?: boolean;
}

const ExerciseForm: React.FC<ExerciseFormProps> = ({
  currentExercise,
  videoPreviewUrl,
  editingExerciseIndex,
  onExerciseChange,
  onVideoUpload,
  onRemoveVideo,
  onAddExercise,
  onValidationChange,
  isVideoUploading = false,
}) => {
  const isEditMode = !!currentExercise;

  const { errors, validateField, validateForm, isValid } = useFormValidation(
    exerciseSchema(isEditMode).omit(["videoFile"]),
    currentExercise,
    false
  );

  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  }, [isValid, onValidationChange]);

  const handleExerciseChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const updatedValue = name.includes("duration") ? Number(value) : value;
    const updatedExercise = {
      ...currentExercise,
      [name]: updatedValue,
    };

    onExerciseChange(updatedExercise);
    await validateField(name, updatedValue);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onVideoUpload(e.target.files[0]);
    }
  };

  // Validate form on initial render
  useEffect(() => {
    validateForm();
  }, []);

  // Add exercise with validation
  const handleAddExercise = async () => {
    // Don't allow adding if video is still uploading
    if (isVideoUploading) {
      return;
    }

    const isValidForm = await validateForm();

    if (isValidForm) {
      onAddExercise();
    }
  };

  return (
    <motion.div variants={itemVariants}>
      <motion.h2
        className="text-2xl font-bold tracking-tight flex items-center mb-6"
        variants={itemVariants}
      >
        <Dumbbell className="mr-3 h-6 w-6 text-purple-600" />
        Add Exercises
      </motion.h2>
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300">
        <CardContent className="pt-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Exercise Name *</Label>
              <Input
                id="name"
                name="name"
                value={currentExercise.name}
                onChange={handleExerciseChange}
                placeholder="Enter exercise name"
                className={`bg-white/80 ${
                  errors.name
                    ? "border-red-300 focus-visible:ring-red-500"
                    : "border-purple-100 focus-visible:ring-purple-500"
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Exercise Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={currentExercise.description}
                onChange={handleExerciseChange}
                placeholder="Describe how to perform this exercise"
                className={`min-h-20 bg-white/80 ${
                  errors.description
                    ? "border-red-300 focus-visible:ring-red-500"
                    : "border-purple-100 focus-visible:ring-purple-500"
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.description}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <div className="flex items-center">
                  <TimerIcon className="mr-2 h-4 w-4 text-purple-600" />
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    min="1"
                    value={currentExercise.duration}
                    onChange={handleExerciseChange}
                    placeholder="Duration"
                    className={`bg-white/80 ${
                      errors.duration
                        ? "border-red-300 focus-visible:ring-red-500"
                        : "border-purple-100 focus-visible:ring-purple-500"
                    }`}
                  />
                </div>
                {errors.duration && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.duration}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="defaultRestDuration">
                  Rest Duration (seconds) *
                </Label>
                <div className="flex items-center">
                  <Hourglass className="mr-2 h-4 w-4 text-indigo-500" />
                  <Input
                    id="defaultRestDuration"
                    name="defaultRestDuration"
                    type="number"
                    min="0"
                    value={currentExercise.defaultRestDuration}
                    onChange={handleExerciseChange}
                    placeholder="Rest time"
                    className={`bg-white/80 ${
                      errors.defaultRestDuration
                        ? "border-red-300 focus-visible:ring-red-500"
                        : "border-purple-100 focus-visible:ring-purple-500"
                    }`}
                  />
                </div>
                {errors.defaultRestDuration && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.defaultRestDuration}
                  </p>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Exercise Video</Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("video-upload")?.click()
                  }
                  className="bg-white/80 border-purple-100 hover:bg-purple-50 hover:text-purple-700"
                  disabled={isVideoUploading}
                >
                  {isVideoUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Video
                    </>
                  )}
                </Button>
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  disabled={isVideoUploading}
                />
                {videoPreviewUrl && !isVideoUploading && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onRemoveVideo}
                    className="bg-white/80 border-red-100 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove Video
                  </Button>
                )}
              </div>
              {videoPreviewUrl && (
                <div className="mt-2 relative overflow-hidden rounded-lg border border-purple-100 aspect-video bg-white/50">
                  <video
                    src={videoPreviewUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                  {isVideoUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="bg-white p-3 rounded-lg flex items-center">
                        <Loader2 className="h-5 w-5 mr-2 text-purple-600 animate-spin" />
                        <span>Uploading video...</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <Button
              type="button" // Ensure this is type="button" to prevent form submission
              onClick={handleAddExercise}
              className="mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg"
              disabled={isVideoUploading}
            >
              {isVideoUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading Video...
                </>
              ) : editingExerciseIndex !== null ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Update Exercise
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Exercise
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ExerciseForm;
