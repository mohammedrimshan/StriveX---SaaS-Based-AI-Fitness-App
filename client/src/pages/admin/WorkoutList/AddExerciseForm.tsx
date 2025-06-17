import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { useWorkouts } from "@/hooks/admin/useWorkouts";
import { Loader2, Video, RefreshCw, X } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { Exercise } from "@/types/Workouts";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { exerciseSchema } from "@/utils/validations/workout.validator";
interface AddExerciseFormProps {
  workoutId: string;
  exerciseId?: string;
  initialData?: Exercise;
  onSuccess?: () => void;
}
interface FormValues {
  name: string;
  description: string;
  duration: number;
  defaultRestDuration: number;
  videoFile?: File | null;
}


const AddExerciseForm = ({ workoutId, exerciseId, initialData, onSuccess }: AddExerciseFormProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addExercise, updateExercise, isAddingExercise, isUpdatingExercise } = useWorkouts();
  const isEditMode = !!exerciseId;

  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [existingVideoUrl, setExistingVideoUrl] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
const schema = exerciseSchema(isEditMode); 
  // Initialize react-hook-form with Yup resolver
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(schema), 
    defaultValues: {
      name: "",
      description: "",
      duration: 60,
      defaultRestDuration: 30,
      videoFile: null,
    },
  });

  // Populate form with initial data in edit mode
  useEffect(() => {
    if (initialData) {
      setValue("name", initialData.name || "");
      setValue("description", initialData.description || "");
      setValue("duration", initialData.duration || 60);
      setValue("defaultRestDuration", initialData.defaultRestDuration || 30);

      if (initialData.videoUrl) {
        setExistingVideoUrl(initialData.videoUrl);
        setVideoPreview(initialData.videoUrl);
      }
    }
  }, [initialData, setValue]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (file: File | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      onChange(file);
      const fileUrl = URL.createObjectURL(file);
      setVideoPreview(fileUrl);
      setExistingVideoUrl(undefined);
    } else {
      onChange(null);
      if (file) {
        toast.error("Please upload a valid video file (MP4, MOV, or WebM)");
      }
    }
  };

  const handleChangeVideo = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveVideo = () => {
    setValue("videoFile", null);
    setVideoPreview(null);
    setExistingVideoUrl(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "edusphere");
      formData.append("folder", "exercises");

      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "strivex";
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.secure_url;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
  try {
    let videoUrl = existingVideoUrl || "";

    if (data.videoFile) {
      toast.loading("Uploading video to Cloudinary...", { id: "video-upload" });
      try {
        videoUrl = await uploadToCloudinary(data.videoFile);
        toast.success("Video uploaded successfully", { id: "video-upload" });
      } catch (error) {
        toast.error("Failed to upload video", { id: "video-upload" });
        return;
      }
    }

    const exerciseData = {
      _id: exerciseId || "",
      name: data.name,
      description: data.description,
      duration: data.duration,
      defaultRestDuration: data.defaultRestDuration,
      videoUrl,
    };

    if (isEditMode && exerciseId) {
      await updateExercise({ workoutId, exerciseId, exerciseData });
      queryClient.setQueryData(["workout", workoutId], (oldData: any) => {
        if (!oldData?.data?.exercises) return oldData;
        const updatedExercises = oldData.data.exercises.map((ex: Exercise) =>
          ex._id === exerciseId ? { ...ex, ...exerciseData } : ex
        );
        return { ...oldData, data: { ...oldData.data, exercises: updatedExercises } };
      });
      toast.success("Exercise updated successfully");
    } else {
      await addExercise({ workoutId, exerciseData });
      toast.success("Exercise added successfully");
    }

    if (!isEditMode) {
      reset({
        name: "",
        description: "",
        duration: 60,
        defaultRestDuration: 30,
        videoFile: null,
      });
      setVideoPreview(null);
      setExistingVideoUrl(undefined);
    } else {
      navigate(`/admin/workouts/${workoutId}`);
    }

    onSuccess?.();
  } catch (error) {
    console.error("Failed to save exercise:", error);
    toast.error(`Failed to ${isEditMode ? "update" : "add"} exercise. Please try again.`);
  }
};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-800"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-15"></div>
      <div className="relative">
        <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
          {isEditMode ? "Edit Exercise" : "Add New Exercise"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
              Exercise Name
            </Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  id="name"
                  {...field}
                  placeholder="e.g., Push-ups"
                  className={`border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 ${
                    errors.name ? "border-red-500" : ""
                  }`}
                />
              )}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </motion.div>

          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">
              Description
            </Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="description"
                  {...field}
                  placeholder="Describe how to perform the exercise..."
                  rows={3}
                  className={`border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 ${
                    errors.description ? "border-red-500" : ""
                  }`}
                />
              )}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-gray-700 dark:text-gray-300">
                Duration (seconds)
              </Label>
              <Controller
                name="duration"
                control={control}
                render={({ field }) => (
                  <Input
                    id="duration"
                    type="number"
                    min={1}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    className={`border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 ${
                      errors.duration ? "border-red-500" : ""
                    }`}
                  />
                )}
              />
              {errors.duration && (
                <p className="text-sm text-red-500">{errors.duration.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="defaultRestDuration"
                className="text-gray-700 dark:text-gray-300"
              >
                Rest Duration (seconds)
              </Label>
              <Controller
                name="defaultRestDuration"
                control={control}
                render={({ field }) => (
                  <Input
                    id="defaultRestDuration"
                    type="number"
                    min={0}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    className={`border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 ${
                      errors.defaultRestDuration ? "border-red-500" : ""
                    }`}
                  />
                )}
              />
              {errors.defaultRestDuration && (
                <p className="text-sm text-red-500">{errors.defaultRestDuration.message}</p>
              )}
            </div>
          </motion.div>

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Label className="text-gray-700 dark:text-gray-300">Exercise Video</Label>
            <Controller
              name="videoFile"
              control={control}
              render={({ field: { onChange } }) => (
                <>
                  {!videoPreview ? (
                    <div
                      className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 cursor-pointer hover:border-indigo-500 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Video className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-400 mt-1">MP4, MOV or WebM (max 100MB)</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleFileChange(e, onChange)}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="mt-4 space-y-4">
                      <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                        <video src={videoPreview} controls className="w-full h-auto max-h-64" />
                        <div className="absolute top-2 right-2 flex space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-white/60 hover:bg-white"
                            onClick={handleChangeVideo}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-gray-800/60 hover:bg-gray-800"
                            onClick={handleRemoveVideo}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        {videoPreview && !existingVideoUrl ? (
                          <>
                            <p className="text-sm text-gray-500">
                              {control._formValues.videoFile?.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {(control._formValues.videoFile?.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </>
                        ) : existingVideoUrl ? (
                          <p className="text-sm text-gray-500">Current video</p>
                        ) : null}
                      </div>
                    </div>
                  )}
                </>
              )}
            />
            {errors.videoFile && (
              <p className="text-sm text-red-500">{errors.videoFile.message}</p>
            )}
          </motion.div>

          <motion.div
            className="flex justify-end pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {isEditMode && (
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/admin/workouts/${workoutId}`)}
                className="mr-2"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isAddingExercise || isUpdatingExercise || isUploading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-2"
            >
              {isAddingExercise || isUpdatingExercise || isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading ? "Uploading..." : isEditMode ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>
                  <Video className="mr-2 h-4 w-4" />
                  {isEditMode ? "Update Exercise" : "Add Exercise"}
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
};

export default AddExerciseForm;