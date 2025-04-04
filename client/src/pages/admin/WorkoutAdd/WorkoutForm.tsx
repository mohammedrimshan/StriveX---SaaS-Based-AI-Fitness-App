import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Dumbbell,
  TimerIcon,
  Hourglass,
  CheckCircle2,
  X,
  PlusCircle,
  Pencil,
  ListTodo,
  BookOpen,
  Award,
  Crown,
  Zap,
  CircleCheck,
  Upload,
  Camera,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Save,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Workout, Exercise } from "@/types/Workouts";
import { useWorkouts } from "@/hooks/admin/useAddWorkout";
import { useToaster } from "@/hooks/ui/useToaster";
import { getAllCategories, CategoryType } from "@/services/admin/adminService";
import { motion } from "framer-motion";
import ReactCrop, { Crop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const emptyExercise: Exercise = {
  name: "",
  description: "",
  duration: 0,
  defaultRestDuration: 30,
};

const WorkoutForm: React.FC = () => {
  const { successToast, errorToast } = useToaster();
  const [activeStep, setActiveStep] = useState(0);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const { addWorkout, isAdding } = useWorkouts();

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

  // Image upload and cropping state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 90,
    height: 90,
    x: 0,
    y: 0,
  });
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  // Fetch categories on mount only
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log("Fetching categories...");
        const response = await getAllCategories({
          page: 1,
          limit: 100,
          search: "",
        });
        setCategories(response.categories);
        console.log("Categories fetched:", response.categories);
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
    return Math.round(exercisesTime + restTime);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setWorkout({ ...workout, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setWorkout({ ...workout, [name]: value });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setWorkout({ ...workout, [name]: checked });
  };

  const handleExerciseChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCurrentExercise({
      ...currentExercise,
      [name]: name.includes("duration") ? Number(value) : value,
    });
  };

  const addExercise = () => {
    if (
      !currentExercise.name ||
      !currentExercise.description ||
      currentExercise.duration <= 0
    ) {
      errorToast("Please fill in all exercise fields correctly.");
      return;
    }

    if (editingExerciseIndex !== null) {
      const updatedExercises = [...workout.exercises];
      updatedExercises[editingExerciseIndex] = currentExercise;
      setWorkout({ ...workout, exercises: updatedExercises });
      setEditingExerciseIndex(null);
    } else {
      setWorkout({
        ...workout,
        exercises: [...workout.exercises, currentExercise],
      });
    }

    setCurrentExercise({ ...emptyExercise });
    const updatedDuration = calculateTotalDuration();
    setWorkout((prev) => ({ ...prev, duration: updatedDuration }));
  };

  const editExercise = (index: number) => {
    setCurrentExercise({ ...workout.exercises[index] });
    setEditingExerciseIndex(index);
  };

  const removeExercise = (index: number) => {
    const updatedExercises = workout.exercises.filter((_, i) => i !== index);
    setWorkout({ ...workout, exercises: updatedExercises });
    setTimeout(() => {
      const updatedDuration = calculateTotalDuration();
      setWorkout((prev) => ({ ...prev, duration: updatedDuration }));
    }, 0);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setUploadedImage(reader.result as string);
        setIsImageDialogOpen(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      const crop = centerCrop(
        makeAspectCrop({ unit: "%", width: 90 }, 16 / 9, width, height),
        width,
        height
      );
      setCrop(crop);
      setCompletedCrop(crop);
      imgRef.current = e.currentTarget;
    },
    []
  );

  const getCroppedImg = useCallback(() => {
    if (!imgRef.current || !completedCrop) return;

    const canvas = document.createElement("canvas");
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(
        imgRef.current,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );

      const base64Image = canvas.toDataURL("image/jpeg");
      setCroppedImageUrl(base64Image);
      setWorkout((prev) => ({ ...prev, imageUrl: base64Image }));
      setIsImageDialogOpen(false);
      setUploadedImage(null); // Reset uploaded image after cropping
    }
  }, [completedCrop]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !workout.title ||
      !workout.description ||
      !workout.category ||
      workout.exercises.length === 0
    ) {
      errorToast(
        "Please fill in all required fields and add at least one exercise."
      );
      return;
    }

    try {
      console.log("Submitting workout:", workout);
      await addWorkout({
        workoutData: workout,
        image: workout.imageUrl,
      });
      successToast("Your workout has been created successfully!");

      // Reset form
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

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <motion.div
            className="space-y-6 form-section"
            variants={containerVariants}
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
            <motion.div className="grid gap-4" variants={containerVariants}>
              <motion.div className="grid gap-2" variants={itemVariants}>
                <Label htmlFor="title">Workout Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={workout.title}
                  onChange={handleChange}
                  placeholder="Enter workout title"
                  className="bg-white/80 backdrop-blur-sm border-purple-100 focus-visible:ring-purple-500"
                />
              </motion.div>
              <motion.div className="grid gap-2" variants={itemVariants}>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={workout.description}
                  onChange={handleChange}
                  placeholder="Describe the workout"
                  className="min-h-32 bg-white/80 backdrop-blur-sm border-purple-100 focus-visible:ring-purple-500"
                />
              </motion.div>
              <motion.div className="grid gap-2" variants={itemVariants}>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={workout.category}
                  onValueChange={(value) =>
                    handleSelectChange("category", value)
                  }
                >
                  <SelectTrigger className="bg-white/80 backdrop-blur-sm border-purple-100">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
              <motion.div className="grid gap-2" variants={itemVariants}>
                <Label htmlFor="difficulty">Difficulty Level *</Label>
                <Select
                  value={workout.difficulty}
                  onValueChange={(value) =>
                    handleSelectChange(
                      "difficulty",
                      value as "Beginner" | "Intermediate" | "Advanced"
                    )
                  }
                >
                  <SelectTrigger className="bg-white/80 backdrop-blur-sm border-purple-100">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>
              <motion.div className="grid gap-2" variants={itemVariants}>
                <Label>Workout Image</Label>
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("image-upload")?.click()
                      }
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
                        onClick={() => {
                          setCroppedImageUrl(null);
                          setWorkout((prev) => ({
                            ...prev,
                            imageUrl: undefined,
                          }));
                        }}
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
              <motion.div
                className="flex items-center space-x-2"
                variants={itemVariants}
              >
                <Switch
                  id="isPremium"
                  checked={workout.isPremium}
                  onCheckedChange={(checked) =>
                    handleSwitchChange("isPremium", checked)
                  }
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
      case 1:
        return (
          <motion.div
            className="space-y-6 form-section"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2
              className="text-2xl font-bold tracking-tight flex items-center"
              variants={itemVariants}
            >
              <Dumbbell className="mr-3 h-6 w-6 text-purple-600" />
              Add Exercises
            </motion.h2>
            <motion.div variants={itemVariants}>
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
                        className="bg-white/80 border-purple-100 focus-visible:ring-purple-500"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">
                        Exercise Description *
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={currentExercise.description}
                        onChange={handleExerciseChange}
                        placeholder="Describe how to perform this exercise"
                        className="min-h-20 bg-white/80 border-purple-100 focus-visible:ring-purple-500"
                      />
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
                            className="bg-white/80 border-purple-100 focus-visible:ring-purple-500"
                          />
                        </div>
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
                            className="bg-white/80 border-purple-100 focus-visible:ring-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={addExercise}
                      className="mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      {editingExerciseIndex !== null ? (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" /> Update
                          Exercise
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
            {workout.exercises.length > 0 && (
              <motion.div
                className="mt-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.h3
                  className="text-lg font-semibold mb-4 flex items-center"
                  variants={itemVariants}
                >
                  <ListTodo className="mr-2 h-5 w-5 text-purple-600" />
                  Exercise List ({workout.exercises.length})
                </motion.h3>
                <motion.div className="space-y-3" variants={containerVariants}>
                  {workout.exercises.map((exercise, index) => (
                    <motion.div
                      key={index}
                      className="bg-white/70 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-4 flex flex-col md:flex-row justify-between border-l-4 border-purple-500"
                      variants={itemVariants}
                      whileHover={{
                        scale: 1.01,
                        transition: { duration: 0.2 },
                      }}
                    >
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <h4 className="font-medium text-purple-700">
                            {exercise.name}
                          </h4>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <TimerIcon className="h-3.5 w-3.5 mr-1 text-purple-500" />
                            <span>{exercise.duration} min</span>
                            <span className="mx-2">|</span>
                            <Hourglass className="h-3.5 w-3.5 mr-1 text-indigo-500" />
                            <span>{exercise.defaultRestDuration}s</span>
                          </div>
                        </div>
                        <p className="text-sm mt-1 text-muted-foreground line-clamp-2">
                          {exercise.description}
                        </p>
                      </div>
                      <div className="flex space-x-2 mt-3 md:mt-0 md:ml-4">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => editExercise(index)}
                          className="h-8 w-8 bg-white/80 hover:bg-purple-50 hover:text-purple-700 border-purple-100"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeExercise(index)}
                          className="h-8 w-8 bg-white/80 hover:bg-red-50 hover:text-red-700 border-red-100"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            className="space-y-6 form-section"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h2
              className="text-2xl font-bold tracking-tight flex items-center"
              variants={itemVariants}
            >
              <CircleCheck className="mr-3 h-6 w-6 text-purple-600" />
              Review & Submit
            </motion.h2>
            <motion.div variants={itemVariants}>
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 text-amber-500" />
                    {workout.title}
                  </CardTitle>
                  <CardDescription className="flex items-center">
                    <Award className="mr-2 h-4 w-4 text-purple-600" />
                    {workout.difficulty} level • {workout.exercises.length}{" "}
                    exercises • {workout.duration} min
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Description
                      </h3>
                      <p className="mt-1">{workout.description}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Category
                      </h3>
                      <p className="mt-1">
                        {categories.find((c) => c._id === workout.category)
                          ?.title || "Uncategorized"}
                      </p>
                    </div>
                    {croppedImageUrl && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Image
                        </h3>
                        <div className="mt-1 aspect-video rounded-md overflow-hidden shadow-sm">
                          <img
                            src={croppedImageUrl}
                            alt={workout.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Exercises ({workout.exercises.length})
                      </h3>
                      <div className="mt-2 space-y-2">
                        {workout.exercises.map((exercise, index) => (
                          <motion.div
                            key={index}
                            className="bg-purple-50/70 p-3 rounded-md border-l-2 border-purple-300"
                            whileHover={{ x: 5, transition: { duration: 0.2 } }}
                          >
                            <div className="flex justify-between">
                              <h4 className="font-medium flex items-center">
                                <Dumbbell className="mr-2 h-3.5 w-3.5 text-purple-600" />
                                {exercise.name}
                              </h4>
                              <div className="text-sm text-muted-foreground">
                                {exercise.duration} min •{" "}
                                {exercise.defaultRestDuration}s rest
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Switch
                        id="status"
                        checked={workout.status}
                        onCheckedChange={(checked) =>
                          handleSwitchChange("status", checked)
                        }
                        className="data-[state=checked]:bg-green-500"
                      />
                      <Label
                        htmlFor="status"
                        className="ml-2 flex items-center"
                      >
                        <Zap className="mr-2 h-4 w-4 text-green-500" />
                        Active Workout
                      </Label>
                    </div>
                    <div className="flex items-center p-3 rounded-md bg-gradient-to-r from-purple-50 to-indigo-50">
                      {workout.isPremium ? (
                        <Crown className="h-5 w-5 text-amber-500 mr-2" />
                      ) : (
                        <Zap className="h-5 w-5 text-green-500 mr-2" />
                      )}
                      <span className="text-sm">
                        {workout.isPremium
                          ? "This is a premium workout"
                          : "This is a free workout"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center">
          <h1 className="text-3xl font-bold tracking-tight text-purple-600 flex items-center space-x-3">
            <Dumbbell className="h-8 w-8 text-purple-600" />
            <span>Create New Workout</span>
          </h1>
        </div>

        <p className="text-muted-foreground mt-2">
          Fill out the form below to create a new workout routine
        </p>
      </div>

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

      <div className="min-h-[500px]">{renderStep()}</div>

      <div className="flex justify-between mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={activeStep === 0}
          className="bg-white/80 border-purple-100 hover:bg-purple-50 hover:text-purple-700 transition-all duration-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        {activeStep < 2 ? (
          <Button
            type="button"
            onClick={nextStep}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={isAdding}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white transition-all duration-300 shadow-md hover:shadow-lg"
          >
            {isAdding ? (
              <>Creating...</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Workout
              </>
            )}
          </Button>
        )}
      </div>

      {/* Image Cropping Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Camera className="mr-2 h-5 w-5 text-purple-600" />
              Crop Workout Image
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {uploadedImage && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={16 / 9}
              >
                <img
                  src={uploadedImage}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  style={{ maxHeight: "60vh", width: "100%" }}
                />
              </ReactCrop>
            )}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsImageDialogOpen(false);
                  setUploadedImage(null);
                }}
                className="border-red-100 hover:bg-red-50 hover:text-red-700"
              >
                Cancel
              </Button>
              <Button
                onClick={getCroppedImg}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90"
                disabled={!completedCrop}
              >
                Apply Crop
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
};

export default WorkoutForm;
