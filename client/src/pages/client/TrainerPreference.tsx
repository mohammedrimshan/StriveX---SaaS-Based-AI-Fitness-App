"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToaster } from "@/hooks/ui/useToaster";
import { useSaveTrainerPreferences, useAutoMatchTrainer } from "@/hooks/client/useBookTrainer";
import { useAllCategoryQuery } from "@/hooks/category/useAllCategory";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { Dumbbell, Goal, Brain, Clock, Flame, Award, Heart, Zap, Sparkles, Leaf, Sun, Moon, Check } from 'lucide-react';
import AnimatedBackground from "@/components/Animation/AnimatedBackgorund";
import AnimatedTitle from "@/components/Animation/AnimatedTitle";
import { getAllCategoriesForClients } from "@/services/client/clientService";

// Define types for our form data, aligned with backend WORKOUT_TYPES
type FormData = {
  preferredWorkout: "Cardio" | "Meditation" | "Pilates" | "Yoga" | "Calisthenics" | "WeightTraining";
  fitnessGoal: "weightLoss" | "muscleGain" | "endurance" | "flexibility" | "maintenance";
  experienceLevel: "beginner" | "intermediate" | "advanced" | "expert";
  skillsToGain: string[];
  selectionMode: "auto";
  sleepFrom: string;
  wakeUpAt: string;
};

// Define static constants
const FITNESS_GOALS = [
  "weightLoss",
  "muscleGain",
  "endurance",
  "flexibility",
  "maintenance",
] as const;

const EXPERIENCE_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
] as const;

const SKILLS = [
  "strengthTraining",
  "mindfulnessFocus",
  "stressManagement",
  "coreStrengthening",
  "postureAlignment",
  "physiotherapy",
  "muscleBuilding",
  "flexibility",
  "nutrition",
  "weightLoss",
] as const;

// Fallback workout types, aligned with backend WORKOUT_TYPES
const FALLBACK_WORKOUT_TYPES: FormData["preferredWorkout"][] = [
  "Cardio",
  "Meditation",
  "Pilates",
  "Yoga",
  "Calisthenics",
  "WeightTraining",
];

// Mapping for API category titles to backend-compatible lowercase values
const workoutTypeMapping: Record<string, string> = {
  cardio: "Cardio",
  CARDIO: "Cardio",
  "cardio workout": "Cardio",
  meditation: "Meditation",
  MEDITATION: "Meditation",
  pilates: "Pilates",
  PILATES: "Pilates",
  yoga: "Yoga",
  YOGA: "Yoga",
  calisthenics: "Calisthenics",
  CALISTHENICS: "Calisthenics",
  weightTraining: "WeightTraining",
  WEIGHTTRAINING: "WeightTraining",
  "weight training": "WeightTraining",
};

// Helper to convert API values to display format
const formatValueForDisplay = (value: string): string => {
  if (!value) return ""; // Add null/undefined check
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());
};

// Get icon for workout type, aligned with backend values
const getWorkoutIcon = (type: FormData["preferredWorkout"]) => {
  const iconMap: Partial<Record<FormData["preferredWorkout"], JSX.Element>> = {
    Yoga: <Leaf className="w-4 h-4 sm:w-5 sm:h-5" />,
    Cardio: <Heart className="w-4 h-4 sm:w-5 sm:h-5" />,
    Pilates: <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />,
    Meditation: <Brain className="w-4 h-4 sm:w-5 sm:h-5" />,
    Calisthenics: <Zap className="w-4 h-4 sm:w-5 sm:h-5" />,
    WeightTraining: <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5" />,
  };
  return iconMap[type] || <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5" />;
};

// Get icon for fitness goal
const getGoalIcon = (goal: string) => {
  switch (goal) {
    case "weightLoss": return <Flame className="w-4 h-4 sm:w-5 sm:h-5" />;
    case "muscleGain": return <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5" />;
    case "endurance": return <Zap className="w-4 h-4 sm:w-5 sm:h-5" />;
    case "flexibility": return <Leaf className="w-4 h-4 sm:w-5 sm:h-5" />;
    case "maintenance": return <Heart className="w-4 h-4 sm:w-5 sm:h-5" />;
    default: return <Goal className="w-4 h-4 sm:w-5 sm:h-5" />;
  }
};

export default function TrainerPreferencesPage() {
  const navigate = useNavigate();
  const { successToast, errorToast } = useToaster();
  const { mutate: savePreferences } = useSaveTrainerPreferences();
  const { mutate: autoMatchTrainer } = useAutoMatchTrainer();

  // Fetch workout categories
  const { data: categoryData, isLoading, isError, refetch } = useAllCategoryQuery(getAllCategoriesForClients);

  // Extract and map categories
  const workoutTypes: FormData["preferredWorkout"][] = categoryData?.categories
    ?.filter((category) => {
      // Skip undefined or null categories
      if (!category || !category.title) return false;
      
      const normalizedTitle = category.title.toLowerCase();
      return Object.keys(workoutTypeMapping).some(
        (key) => key.toLowerCase() === normalizedTitle
      );
    })
    .map((category) => {
      const normalizedTitle = category.title.toLowerCase();
      const mappedType = workoutTypeMapping[normalizedTitle];
      // Ensure we're returning a valid workout type
      return mappedType as FormData["preferredWorkout"];
    }) || FALLBACK_WORKOUT_TYPES;

  // Use fallback if no valid workout types are found
  const displayWorkoutTypes = workoutTypes.length > 0 ? workoutTypes : FALLBACK_WORKOUT_TYPES;

  // Debug fetched categories
  console.log("Fetched categories:", categoryData?.categories);
  console.log("Mapped workout types:", displayWorkoutTypes);

  const [formData, setFormData] = useState<FormData>({
    preferredWorkout: "Cardio",
    fitnessGoal: "weightLoss",
    experienceLevel: "beginner",
    skillsToGain: [],
    selectionMode: "auto",
    sleepFrom: "",
    wakeUpAt: "",
  });

  // Current step state
  const [currentStep, setCurrentStep] = useState(0);

  // Form steps configuration
  const steps = [
    {
      title: "Workout Preferences",
      icon: <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />,
      description: "Tell us about your workout style and goals",
    },
    {
      title: "Experience & Schedule",
      icon: <Clock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />,
      description: "Share your experience level and availability",
    },
    {
      title: "Skills & Goals",
      icon: <Brain className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />,
      description: "Select skills you want to develop",
    },
  ];

  // Validation for each step
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!formData.preferredWorkout && !!formData.fitnessGoal;
      case 1:
        return !!formData.experienceLevel && !!formData.sleepFrom && !!formData.wakeUpAt;
      case 2:
        return formData.skillsToGain.length > 0;
      default:
        return true;
    }
  };

  const handleSelectChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkillChange = (skill: string, checked: boolean) => {
    setFormData((prev) => {
      if (checked) {
        return { ...prev, skillsToGain: [...prev.skillsToGain, skill] };
      } else {
        return { ...prev, skillsToGain: prev.skillsToGain.filter((s) => s !== skill) };
      }
    });
  };

  const handleTimeChange = (name: "sleepFrom" | "wakeUpAt", value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) {
      errorToast("Please complete all required fields");
      return;
    }

    savePreferences(formData, {
      onSuccess: () => {
        successToast("Preferences saved successfully");
        autoMatchTrainer(undefined, {
          onSuccess: () => {
            navigate("/trainer-selection");
          },
          onError: (error: Error) => {
            errorToast(error.message || "Failed to match trainer");
          },
        });
      },
      onError: (error: Error) => {
        errorToast(error.message || "Failed to save preferences");
      },
    });
  };

  // Render form step content
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6 md:space-y-8">
            <motion.div
              className="space-y-3 md:space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Label htmlFor="preferredWorkout" className="text-base md:text-lg font-medium">
                Preferred Workout
              </Label>
              {isLoading ? (
                <div className="text-gray-600">Loading workout categories...</div>
              ) : isError ? (
                <div className="text-red-600">
                  Error loading workout categories.{' '}
                  <button
                    onClick={() => refetch()}
                    className="text-indigo-600 hover:underline"
                  >
                    Retry
                  </button>
                </div>
              ) : displayWorkoutTypes.length === 0 ? (
                <div className="text-gray-600">No workout categories available.</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                  {displayWorkoutTypes.map((type, index) => (
                    <motion.div
                      key={`${type}-${index}`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectChange("preferredWorkout", type)}
                      className={`flex flex-col items-center justify-center p-2 sm:p-3 md:p-4 rounded-xl cursor-pointer border-2 transition-all ${
                        formData.preferredWorkout === type
                          ? "border-purple-500 bg-purple-50 shadow-md"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                    >
                      <div
                        className={`p-2 sm:p-3 rounded-full mb-1 sm:mb-2 ${
                          formData.preferredWorkout === type
                            ? "bg-purple-500 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {getWorkoutIcon(type)}
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-center">
                        {formatValueForDisplay(type)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div
              className="space-y-3 md:space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Label htmlFor="fitnessGoal" className="text-base md:text-lg font-medium">
                Fitness Goal
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                {FITNESS_GOALS.map((goal) => (
                  <motion.div
                    key={goal}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectChange("fitnessGoal", goal)}
                    className={`flex flex-col items-center justify-center p-2 sm:p-3 md:p-4 rounded-xl cursor-pointer border-2 transition-all ${
                      formData.fitnessGoal === goal
                        ? "border-indigo-500 bg-indigo-50 shadow-md"
                        : "border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    <div
                      className={`p-2 sm:p-3 rounded-full mb-1 sm:mb-2 ${
                        formData.fitnessGoal === goal
                          ? "bg-indigo-500 text-white"
                        : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {getGoalIcon(goal)}
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-center">
                      {formatValueForDisplay(goal)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6 md:space-y-8">
            <motion.div
              className="space-y-3 md:space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Label htmlFor="experienceLevel" className="text-base md:text-lg font-medium">
                Experience Level
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                {EXPERIENCE_LEVELS.map((level) => (
                  <motion.div
                    key={level}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectChange("experienceLevel", level)}
                    className={`flex flex-col items-center justify-center p-2 sm:p-3 md:p-4 rounded-xl cursor-pointer border-2 transition-all ${
                      formData.experienceLevel === level
                        ? "border-teal-500 bg-teal-50 shadow-md"
                        : "border-gray-200 hover:border-teal-300"
                    }`}
                  >
                    <div
                      className={`p-2 sm:p-3 rounded-full mb-1 sm:mb-2 ${
                        formData.experienceLevel === level
                          ? "bg-teal-500 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-center">
                      {formatValueForDisplay(level)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="space-y-3 md:space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="flex items-center gap-2">
                <Label className="text-base md:text-lg font-medium">Your Sleep Schedule</Label>
                <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                  For Availability
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                This helps us match you with trainers who are available during your active hours
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-2">
                <motion.div
                  className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-xl border-2 border-gray-200 bg-white"
                  whileHover={{ boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                >
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                    <Label htmlFor="sleepFrom" className="text-sm sm:text-base font-medium">
                      Sleep Time
                    </Label>
                  </div>
                  <Input
                    id="sleepFrom"
                    type="time"
                    value={formData.sleepFrom}
                    onChange={(e) => handleTimeChange("sleepFrom", e.target.value)}
                    required
                    className="w-full border-2 focus:border-indigo-500 h-10 sm:h-12 rounded-lg"
                  />
                </motion.div>

                <motion.div
                  className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-xl border-2 border-gray-200 bg-white"
                  whileHover={{ boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
                >
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                    <Label htmlFor="wakeUpAt" className="text-sm sm:text-base font-medium">
                      Wake Up Time
                    </Label>
                  </div>
                  <Input
                    id="wakeUpAt"
                    type="time"
                    value={formData.wakeUpAt}
                    onChange={(e) => handleTimeChange("wakeUpAt", e.target.value)}
                    required
                    className="w-full border-2 focus:border-indigo-500 h-10 sm:h-12 rounded-lg"
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>
        );

      case 2:
        return (
          <motion.div
            className="space-y-4 md:space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <Label className="text-base md:text-lg font-medium">Skills to Gain</Label>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Select skills you'd like to develop with your trainer (select at least one)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-6 gap-y-2 md:gap-y-3 pt-2">
              {SKILLS.map((skill) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-center space-x-3 p-2 sm:p-3 rounded-lg transition-all ${
                    formData.skillsToGain.includes(skill)
                      ? "bg-gradient-to-r from-purple-50 to-indigo-50 border border-indigo-200"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <Checkbox
                    id={`skill-${skill}`}
                    checked={formData.skillsToGain.includes(skill)}
                    onCheckedChange={(checked) => handleSkillChange(skill, checked === true)}
                    className={`h-4 w-4 sm:h-5 sm:w-5 ${
                      formData.skillsToGain.includes(skill)
                        ? "border-indigo-500 text-indigo-500"
                        : ""
                    }`}
                  />
                  <div className="flex flex-1 items-center justify-between">
                    <Label
                      htmlFor={`skill-${skill}`}
                      className="text-xs sm:text-sm font-medium cursor-pointer"
                    >
                      {formatValueForDisplay(skill)}
                    </Label>
                    {formData.skillsToGain.includes(skill) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-indigo-100 rounded-full p-1"
                      >
                        <Check className="h-3 w-3 text-indigo-600" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatedBackground>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        <AnimatedTitle
          title="Find Your Trainer"
          subtitle="Tell us about your preferences to match with the right trainer for your fitness journey"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <Card className="w-full mx-auto backdrop-blur-sm bg-white/80 border-0 shadow-xl">
            <div className="relative pt-6 md:pt-8 px-4 sm:px-6 lg:px-12">
              {/* Progress stepper */}
              <div className="relative mb-6 md:mb-8">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-600"
                    initial={{ width: "0%" }}
                    animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                <div className="relative z-10 flex justify-between">
                  {steps.map((step, index) => (
                    <motion.div
                      key={index}
                      className="flex flex-col items-center"
                      onClick={() => index < currentStep && setCurrentStep(index)}
                      whileHover={index < currentStep ? { scale: 1.05 } : {}}
                      whileTap={index < currentStep ? { scale: 0.95 } : {}}
                    >
                      <motion.div
                        className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full transition-all cursor-pointer ${
                          index < currentStep
                            ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md"
                            : index === currentStep
                              ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg ring-4 ring-purple-100"
                              : "bg-gray-100 text-gray-400"
                        }`}
                        initial={false}
                        animate={
                          index <= currentStep
                            ? {
                                scale: [null, 1.2, 1],
                                boxShadow:
                                  index === currentStep
                                    ? "0 10px 25px -5px rgba(124, 58, 237, 0.4)"
                                    : "none",
                              }
                            : {}
                        }
                        transition={{ duration: 0.4 }}
                      >
                        {step.icon}
                      </motion.div>

                      <motion.span
                        className={`text-xs sm:text-sm font-medium mt-1 sm:mt-2 hidden sm:block ${
                          index <= currentStep ? "text-indigo-700" : "text-gray-500"
                        }`}
                        initial={false}
                        animate={
                          index === currentStep
                            ? {
                                scale: [null, 1.1, 1],
                                fontWeight: "bold",
                              }
                            : {}
                        }
                      >
                        {step.title}
                      </motion.span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <CardContent className="px-4 sm:px-6 lg:px-12 pb-4">
                <form onSubmit={handleSubmit}>
                  <div className="min-h-[300px] sm:min-h-[350px] md:min-h-[400px]">
                    {renderStepContent(currentStep)}
                  </div>

                  <CardFooter className="flex justify-between p-4 sm:p-6 lg:px-12 bg-gradient-to-r from-purple-50 to-indigo-50 border-t border-indigo-100">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(currentStep - 1)}
                        disabled={currentStep === 0}
                        className="gap-2 px-4 sm:px-6 bg-white border-2 border-gray-200 hover:bg-gray-50 hover:text-indigo-700 rounded-md py-1.5 sm:py-2 text-sm sm:text-base"
                      >
                        Back
                      </button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      {currentStep < steps.length - 1 ? (
                        <button
                          type="button"
                          onClick={() => validateStep(currentStep) && setCurrentStep(currentStep + 1)}
                          disabled={!validateStep(currentStep)}
                          className="gap-2 px-4 sm:px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 rounded-md py-1.5 sm:py-2 text-sm sm:text-base"
                        >
                          Next
                        </button>
                      ) : (
                        <button
                          type="submit"
                          className="gap-2 px-4 sm:px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 rounded-md py-1.5 sm:py-2 text-sm sm:text-base"
                        >
                          Find My Trainer
                        </button>
                      )}
                    </motion.div>
                  </CardFooter>
                </form>
              </CardContent>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatedBackground>
  );
}