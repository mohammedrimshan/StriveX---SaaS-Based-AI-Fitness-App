import React, { useState, useEffect, useRef } from "react";
import { Dumbbell } from "lucide-react";
import { Workout, Exercise } from "@/types/Workouts";
import { useWorkouts } from "@/hooks/admin/useAddWorkout";
import { useToaster } from "@/hooks/ui/useToaster";
import { getAllCategories } from "@/services/admin/adminService";
import { motion } from "framer-motion";
import axios from "axios";
import BasicInfoForm from "./BasicInfoForm";
import ExerciseForm from "./ExerciseForm";
import ExerciseList from "./ExerciseList";
import ReviewStep from "./ReviewStep";
import StepNavigation from "./StepNavigation";
import ImageCropDialog from "./ImageCropDialog";
import { CategoryType } from "@/hooks/admin/useAllCategory";

const emptyExercise: Exercise = {
  id: "",
  name: "",
  description: "",
  duration: 0,
  defaultRestDuration: 30,
  videoUrl: "",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const WorkoutForm: React.FC = () => {
  const { successToast, errorToast } = useToaster();
  const [activeStep, setActiveStep] = useState(0);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const { addWorkout, isAdding } = useWorkouts();
  const formRef = useRef<HTMLFormElement>(null);
  const [isVideoUploading, setIsVideoUploading] = useState(false);

  const [workout, setWorkout] = useState<Workout>({
    title: "",
    description: "",
    category: "",
    duration: 0,
    difficulty: "Beginner",
    exercises: [],
    isPremium: false,
    status: true,
  });

  const [currentExercise, setCurrentExercise] = useState<Exercise>({
    ...emptyExercise,
  });
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<
    number | null
  >(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllCategories({
          page: 1,
          limit: 100,
          search: "",
        });
        setCategories(response?.categories);
      } catch (error) {
        errorToast("Failed to fetch categories.");
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, [errorToast]);

  const calculateTotalDuration = () => {
    const exercisesTime = workout.exercises.reduce(
      (sum, ex) => sum + ex.duration,
      0
    );
    const restTime =
      workout.exercises.reduce((sum, ex) => sum + ex.defaultRestDuration, 0) /
      60;
    return Math.max(1, Math.round(exercisesTime + restTime));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submission triggered");

    // Only allow submission on the last step
    if (activeStep !== 2) {
      console.log("Prevented submission: not on last step");
      return;
    }

    const updatedDuration = calculateTotalDuration();
    setWorkout((prev) => ({ ...prev, duration: updatedDuration }));

    if (
      !workout.title ||
      workout.title.trim() === "" ||
      !workout.description ||
      !workout.category ||
      workout.category.trim() === "" ||
      workout.exercises.length === 0 ||
      updatedDuration <= 0
    ) {
      errorToast(
        "Please fill in all required fields (title, category, duration > 0) and add at least one exercise."
      );
      return;
    }

    try {
      await addWorkout({
        workoutData: {
          title: workout.title,
          description: workout.description,
          category: workout.category,
          duration: updatedDuration,
          difficulty: workout.difficulty,
          exercises: workout.exercises.map((ex) => ({
            id: ex.id || crypto.randomUUID(),
            name: ex.name,
            description: ex.description,
            duration: ex.duration,
            defaultRestDuration: ex.defaultRestDuration,
            videoUrl: ex.videoUrl || "", // Ensure it's a string
          })),
          isPremium: workout.isPremium,
          status: workout.status,
        },
        image: workout.imageUrl || undefined,
      });
      successToast("Your workout has been created successfully!");
      setWorkout({
        title: "",
        description: "",
        category: "",
        duration: 0,
        difficulty: "Beginner",
        exercises: [],
        isPremium: false,
        status: true,
      });
      setCroppedImageUrl(null);
      setActiveStep(0);
    } catch (error) {
      errorToast("An error occurred while creating the workout.");
      console.error("Error creating workout:", error);
    }
  };

  const nextStep = () => {
    if (
      activeStep === 0 &&
      (!workout.title || !workout.description || !workout.category)
    ) {
      errorToast("Please fill in all required fields before proceeding.");
      return;
    }
    if (activeStep < 2) setActiveStep(activeStep + 1);
  };

  const prevStep = () => {
    if (activeStep > 0) setActiveStep(activeStep - 1);
  };

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
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.secure_url;
    } catch (error: any) {
      throw error;
    }
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <BasicInfoForm
            workout={workout}
            categories={categories}
            croppedImageUrl={croppedImageUrl}
            onChange={setWorkout}
            onImageUpload={(image) => {
              setUploadedImage(image);
              setIsImageDialogOpen(true);
            }}
            onRemoveImage={() => {
              setCroppedImageUrl(null);
              setWorkout((prev) => ({ ...prev, imageUrl: undefined }));
            }}
          />
        );
      case 1:
        return (
          <>
            <ExerciseForm
              currentExercise={currentExercise}
              videoPreviewUrl={videoPreviewUrl}
              editingExerciseIndex={editingExerciseIndex}
              onExerciseChange={setCurrentExercise}
              onVideoUpload={async (file) => {
                // Set uploading flag
                setIsVideoUploading(true);

                // Always set local preview immediately for user feedback
                const previewUrl = URL.createObjectURL(file);
                setVideoPreviewUrl(previewUrl);

                try {
                  // Upload to cloudinary - wait for completion
                  const cloudinaryUrl = await uploadToCloudinary(
                    file,
                    "exercises/videos",
                    "video"
                  );

                  console.log("Video uploaded successfully:", cloudinaryUrl);

                  // Update the current exercise with the URL
                  setCurrentExercise((prev) => {
                    const updated = { ...prev, videoUrl: cloudinaryUrl };
                    console.log("Updated exercise with video:", updated);
                    return updated;
                  });
                } catch (error) {
                  errorToast("Failed to upload video to Cloudinary.");
                  console.error("Video upload error:", error);
                  // Clear preview on error
                  setVideoPreviewUrl(null);
                } finally {
                  // Clear uploading flag
                  setIsVideoUploading(false);
                }
              }}
              onRemoveVideo={() => {
                setVideoPreviewUrl(null);
                setCurrentExercise((prev) => ({ ...prev, videoUrl: "" }));
              }}
              onAddExercise={() => {
                if (isVideoUploading) {
                  errorToast("Please wait for video upload to complete.");
                  return;
                }

                if (
                  !currentExercise.name ||
                  !currentExercise.description ||
                  currentExercise.duration <= 0
                ) {
                  errorToast(
                    "Please fill in all exercise fields correctly (duration must be greater than 0)."
                  );
                  return;
                }

                // Create a complete exercise object with all necessary fields
                const exerciseToAdd: Exercise = {
                  ...currentExercise,
                  id: currentExercise.id || crypto.randomUUID(),
                  videoUrl: currentExercise.videoUrl || "", // Ensure it's a string
                };

                console.log("Adding exercise:", exerciseToAdd);

                if (editingExerciseIndex !== null) {
                  const updatedExercises = [...workout.exercises];
                  updatedExercises[editingExerciseIndex] = exerciseToAdd;
                  setWorkout((prev) => {
                    const updated = { ...prev, exercises: updatedExercises };
                    console.log(
                      "Updated exercises list (edit):",
                      updated.exercises
                    );
                    return updated;
                  });
                  setEditingExerciseIndex(null);
                } else {
                  setWorkout((prev) => {
                    const updated = {
                      ...prev,
                      exercises: [...prev.exercises, exerciseToAdd],
                    };
                    console.log(
                      "Updated exercises list (add):",
                      updated.exercises
                    );
                    return updated;
                  });
                }

                // Reset form and update duration
                setCurrentExercise({ ...emptyExercise });
                setVideoPreviewUrl(null);

                // Calculate new duration based on updated exercises
                const updatedDuration = calculateTotalDuration();
                setWorkout((prev) => ({ ...prev, duration: updatedDuration }));
              }}
              isVideoUploading={isVideoUploading}
            />
            {workout.exercises.length > 0 && (
              <ExerciseList
                exercises={workout.exercises}
                onEdit={(index) => {
                  // Deep copy to avoid reference issues
                  const exerciseToEdit = JSON.parse(
                    JSON.stringify(workout.exercises[index])
                  );
                  console.log("Editing exercise:", exerciseToEdit);

                  // Set all properties explicitly
                  setCurrentExercise({
                    id: exerciseToEdit.id || "",
                    name: exerciseToEdit.name || "",
                    description: exerciseToEdit.description || "",
                    duration: exerciseToEdit.duration || 0,
                    defaultRestDuration:
                      exerciseToEdit.defaultRestDuration || 30,
                    videoUrl: exerciseToEdit.videoUrl || "",
                  });

                  setVideoPreviewUrl(exerciseToEdit.videoUrl || null);
                  setEditingExerciseIndex(index);
                }}
                onRemove={(index) => {
                  const updatedExercises = workout.exercises.filter(
                    (_, i) => i !== index
                  );
                  setWorkout({ ...workout, exercises: updatedExercises });
                  const updatedDuration = calculateTotalDuration();
                  setWorkout((prev) => ({
                    ...prev,
                    duration: updatedDuration,
                  }));
                }}
              />
            )}
          </>
        );
      case 2:
        return (
          <ReviewStep
            workout={workout}
            categories={categories}
            croppedImageUrl={croppedImageUrl}
            onStatusChange={(status) =>
              setWorkout((prev) => ({ ...prev, status }))
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    // Use onSubmit only for intentional submissions from the final step
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault(); // Always prevent default form submission
        if (activeStep === 2) {
          handleSubmit(e);
        } else {
          console.log("Form submission prevented - not on final step");
        }
      }}
      className="max-w-3xl mx-auto"
    >
      <motion.div
        className="mb-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="flex items-center justify-center">
          <h1 className="text-3xl font-bold tracking-tight text-purple-600 flex items-center space-x-3">
            <Dumbbell className="h-8 w-8 text-purple-600" />
            <span>Create New Workout</span>
          </h1>
        </motion.div>
        <motion.p className="text-muted-foreground mt-2">
          Fill out the form below to create a new workout routine
        </motion.p>
      </motion.div>

      {/* Progress Bar and Step Labels */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span
            className={`text-sm font-medium ${
              activeStep === 0 ? "text-purple-600 font-semibold" : ""
            }`}
          >
            Basic Info
          </span>
          <span
            className={`text-sm font-medium ${
              activeStep === 1 ? "text-purple-600 font-semibold" : ""
            }`}
          >
            Exercises
          </span>
          <span
            className={`text-sm font-medium ${
              activeStep === 2 ? "text-purple-600 font-semibold" : ""
            }`}
          >
            Review
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-6">
          <div
            className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${(activeStep + 1) * 33.33}%` }}
          ></div>
        </div>
      </div>

      {/* Form Content */}
      <div className="min-h-[500px]">{renderStep()}</div>

      {/* Navigation Buttons at the Bottom */}
      <StepNavigation
        activeStep={activeStep}
        isAdding={isAdding}
        onPrev={prevStep}
        onNext={nextStep}
      />

      <ImageCropDialog
        isOpen={isImageDialogOpen}
        uploadedImage={uploadedImage}
        onClose={() => {
          setIsImageDialogOpen(false);
          setUploadedImage(null);
        }}
        onCrop={async (croppedFile) => {
          try {
            const cloudinaryUrl = await uploadToCloudinary(
              croppedFile,
              "workouts/images",
              "image"
            );
            setCroppedImageUrl(cloudinaryUrl);
            setWorkout((prev) => ({ ...prev, imageUrl: cloudinaryUrl }));
            setIsImageDialogOpen(false);
            setUploadedImage(null);
          } catch (error) {
            errorToast("Failed to upload cropped image to Cloudinary.");
            console.error("Image upload error:", error);
          }
        }}
        dialogTitle="Crop Workout Image"
        aspectRatio={16 / 9}
        maxWidth={600}
      />
    </form>
  );
};

export default WorkoutForm;
