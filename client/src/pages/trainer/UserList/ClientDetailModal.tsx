"use client";

import type React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  formatFitnessGoal,
  formatExperienceLevel,
  formatActivityLevel,
  formatHealthCondition,
  formatDietPreference,
  formatSkill,
  formatSelectionMode,
  getWaterIntakeLevel,
  getWaterIntakeColor,
} from "@/types/UserList";
import type { IClient } from "@/types/User";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  Clock,
  Droplet,
  ActivitySquare,
  Dumbbell,
  Heart,
  Award,
  User,
  Scale,
  Flame,
  StretchVerticalIcon as Stretch,
  Activity,
  Utensils,
  Calendar,
  BadgeCheck,
} from "lucide-react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ClientDetailModalProps {
  client: IClient | null;
  isOpen: boolean;
  onClose: () => void;
}

const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  client,
  isOpen,
  onClose,
}) => {
  if (!client) return null;

  const getGoalIcon = (goal: string) => {
    switch (goal) {
      case "weightLoss":
        return <Scale className="w-5 h-5" />;
      case "muscleGain":
        return <Dumbbell className="w-5 h-5" />;
      case "endurance":
        return <Activity className="w-5 h-5" />;
      case "flexibility":
        return <Stretch className="w-5 h-5" />;
      case "maintenance":
        return <Flame className="w-5 h-5" />;
      default:
        return <Dumbbell className="w-5 h-5" />;
    }
  };

  const getWaterIntakePercentage = (intake: number): number => {
    if (intake <= 0) return 0;
    if (intake >= 8000) return 100;
    return (intake / 8000) * 100;
  };

  const MotionItem = ({
    children,
    delay = 0,
  }: {
    children: React.ReactNode;
    delay?: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="mb-5"
    >
      {children}
    </motion.div>
  );

  const getBadgeColorForFitnessGoal = (goal: string) => {
    switch (goal) {
      case "weightLoss":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-orange-300";
      case "muscleGain":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "endurance":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "flexibility":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "maintenance":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  const getExperienceLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "intermediate":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "advanced":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "expert":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <DialogContent className="max-w-6xl lg:max-w-7xl max-h-[90vh] overflow-y-auto p-0 gap-0 custom-scrollbar">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="sticky top-0 z-10 bg-white dark:bg-gray-800 pt-6 px-6 lg:pt-8 lg:px-8 pb-4 border-b dark:border-gray-700"
            >
              <DialogHeader>
                <DialogTitle className="text-2xl lg:text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Client Profile
                </DialogTitle>
                <DialogDescription className="text-center lg:text-lg">
                  Detailed information about {client.firstName} {client.lastName}
                </DialogDescription>
              </DialogHeader>
            </motion.div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start px-6 lg:px-8 pt-2 lg:pt-4 bg-transparent">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 dark:data-[state=active]:bg-purple-900/30 dark:data-[state=active]:text-purple-100 lg:text-lg lg:px-6 lg:py-2"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="fitness"
                  className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 dark:data-[state=active]:bg-purple-900/30 dark:data-[state=active]:text-purple-100 lg:text-lg lg:px-6 lg:py-2"
                >
                  Fitness Details
                </TabsTrigger>
                <TabsTrigger
                  value="health"
                  className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900 dark:data-[state=active]:bg-purple-900/30 dark:data-[state=active]:text-purple-100 lg:text-lg lg:px-6 lg:py-2"
                >
                  Health & Nutrition
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="p-6 lg:p-8 pt-4 lg:pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-3 gap-6 lg:gap-8">
                  {/* Profile Section */}
                  <div className="col-span-1 flex flex-col items-center lg:col-span-1 lg:sticky lg:top-24 lg:self-start">
                    <div className="relative mb-6 lg:mb-8">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, type: "spring" }}
                        className="relative"
                      >
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 blur-md opacity-30 animate-pulse" />
                        {client.profileImage ? (
                          <img
                            src={client.profileImage}
                            alt={`${client.firstName} ${client.lastName}`}
                            className="relative w-40 h-40 lg:w-48 lg:h-48 object-cover rounded-full border-4 border-white dark:border-gray-800 shadow-xl"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://via.placeholder.com/80?text=User";
                            }}
                          />
                        ) : (
                          <div className="relative w-40 h-40 lg:w-48 lg:h-48 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full border-4 border-white dark:border-gray-800 shadow-xl">
                            <User className="w-20 h-20 lg:w-24 lg:h-24 text-gray-500 dark:text-gray-400" />
                          </div>
                        )}
                      </motion.div>
                      <motion.div
                        className="absolute -bottom-3 lg:-bottom-4 left-1/2 -translate-x-1/2"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                      >
                        <Badge
                          className={`flex items-center gap-2 px-4 py-2 ${getBadgeColorForFitnessGoal(
                            client.fitnessGoal || "N/A"
                          )}`}
                        >
                          {getGoalIcon(client.fitnessGoal || "")}
                          <span className="font-medium">
                            {formatFitnessGoal(client.fitnessGoal || "N/A")}
                          </span>
                        </Badge>
                      </motion.div>
                    </div>

                    <motion.h3
                      className="text-xl lg:text-2xl font-bold mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.3 }}
                    >
                      {client.firstName} {client.lastName}
                    </motion.h3>

                    <motion.div
                      className="flex items-center text-sm lg:text-base text-gray-600 dark:text-gray-300 mt-2 lg:mt-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                    >
                      <Mail className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-purple-500" />
                      <span>{client.email}</span>
                    </motion.div>

                    <motion.div
                      className="flex items-center text-sm lg:text-base text-gray-600 dark:text-gray-300 mt-1 lg:mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.3 }}
                    >
                      <Phone className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-purple-500" />
                      <span>{client.phoneNumber || "N/A"}</span>
                    </motion.div>

                    <motion.div
                      className="flex items-center text-sm lg:text-base text-gray-600 dark:text-gray-300 mt-1 lg:mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.3 }}
                    >
                      <Calendar className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-purple-500" />
                      <span>
                        Joined{" "}
                        {format(
                          new Date(client.createdAt || new Date()),
                          "MMM dd, yyyy"
                        )}
                      </span>
                    </motion.div>

                    {client.isPremium && (
                      <motion.div
                        className="mt-4 lg:mt-6"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7, duration: 0.3 }}
                      >
                        <Badge
                          variant="outline"
                          className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2"
                        >
                          <BadgeCheck className="w-4 h-4 lg:w-5 lg:h-5" />
                          <span className="font-medium">Premium Member</span>
                        </Badge>
                      </motion.div>
                    )}

                    <motion.div
                      className="w-full bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 lg:p-6 mt-6 lg:mt-8 border border-purple-100 dark:border-purple-800"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8, duration: 0.3 }}
                    >
                      <div className="flex items-center text-sm lg:text-base font-medium">
                        <User className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-purple-500" />
                        <span>Selection Mode:</span>
                        <span className="ml-auto font-semibold">
                          {formatSelectionMode(client.selectionMode || "N/A")}
                        </span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Main Details */}
                  <div className="col-span-1 md:col-span-3 lg:col-span-2">
                    <MotionItem delay={0.3}>
                      <h4 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4 flex items-center">
                        <ActivitySquare className="w-5 h-5 lg:w-6 lg:h-6 mr-2 text-purple-500" />
                        Quick Stats
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 lg:gap-4">
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 lg:p-5 border border-purple-100 dark:border-purple-800">
                          <div className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mb-1 lg:mb-2">
                            Experience
                          </div>
                          <div className="font-medium lg:font-semibold text-purple-900 dark:text-purple-100 lg:text-lg">
                            {formatExperienceLevel(
                              client.experienceLevel || "N/A"
                            )}
                          </div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 lg:p-5 border border-blue-100 dark:border-blue-800">
                          <div className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mb-1 lg:mb-2">
                            Activity Level
                          </div>
                          <div className="font-medium lg:font-semibold text-blue-900 dark:text-blue-100 lg:text-lg">
                            {formatActivityLevel(client.activityLevel || "N/A")}
                          </div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 lg:p-5 border border-green-100 dark:border-green-800">
                          <div className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mb-1 lg:mb-2">
                            Diet
                          </div>
                          <div className="font-medium lg:font-semibold text-green-900 dark:text-blue-100 lg:text-lg">
                            {formatDietPreference(
                              client.dietPreference || "N/A"
                            )}
                          </div>
                        </div>
                      </div>
                    </MotionItem>

                    <MotionItem delay={0.4}>
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4 lg:p-6 border border-blue-100 dark:border-blue-800">
                        <div className="flex items-center justify-between mb-2 lg:mb-3">
                          <div className="flex items-center">
                            <Droplet
                              className={`w-5 h-5 lg:w-6 lg:h-6 mr-2 ${getWaterIntakeColor(
                                client.waterIntake || 0
                              )}`}
                            />
                            <h4 className="font-medium lg:text-lg">Water Intake</h4>
                          </div>
                          <div
                            className={`text-sm lg:text-base font-medium ${getWaterIntakeColor(
                              client.waterIntake || 0
                            )}`}
                          >
                            {getWaterIntakeLevel(client.waterIntake || 0)}
                          </div>
                        </div>
                        <Progress
                          value={getWaterIntakePercentage(
                            client.waterIntake || 0
                          )}
                          className="h-2 lg:h-3 bg-blue-100 dark:bg-blue-900/50"
                        />
                        <div className="flex justify-between mt-2 lg:mt-3 text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                          <span>{client.waterIntake || 0} ml</span>
                          <span>Target: 8000 ml</span>
                        </div>
                      </div>
                    </MotionItem>

                    <MotionItem delay={0.5}>
                      <h4 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4 flex items-center">
                        <Clock className="w-5 h-5 lg:w-6 lg:h-6 mr-2 text-purple-500" />
                        Sleep Schedule
                      </h4>
                      <div className="grid grid-cols-2 gap-3 lg:gap-4">
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 lg:p-5 border border-indigo-100 dark:border-indigo-800 flex items-center">
                          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center mr-3 lg:mr-4">
                            <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-600 dark:text-indigo-300" />
                          </div>
                          <div>
                            <div className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                              Sleep Time
                            </div>
                            <div className="font-medium lg:font-semibold text-indigo-900 dark:text-indigo-100 lg:text-lg">
                              {client.sleepFrom || "N/A"}
                            </div>
                          </div>
                        </div>
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 lg:p-5 border border-indigo-100 dark:border-indigo-800 flex items-center">
                          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center mr-3 lg:mr-4">
                            <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-600 dark:text-indigo-300" />
                          </div>
                          <div>
                            <div className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                              Wake Up Time
                            </div>
                            <div className="font-medium lg:font-semibold text-indigo-900 dark:text-indigo-100 lg:text-lg">
                              {client.wakeUpAt || "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </MotionItem>

                    <MotionItem delay={0.6}>
                      <h4 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4 flex items-center">
                        <Award className="w-5 h-5 lg:w-6 lg:h-6 mr-2 text-purple-500" />
                        Skills To Gain
                      </h4>
                      <div className="flex flex-wrap gap-2 lg:gap-3">
                        {client.skillsToGain.map((skill, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              delay: 0.6 + index * 0.05,
                              duration: 0.3,
                            }}
                          >
                            <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 dark:from-purple-900/40 dark:to-pink-900/40 dark:text-purple-200 border-0 px-3 py-1.5 lg:px-4 lg:py-2">
                              {formatSkill(skill)}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </MotionItem>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="fitness" className="p-6 lg:p-8 pt-4 lg:pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 lg:gap-6 max-w-full lg:max-w-6xl lg:mx-auto">
                  <MotionItem>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border border-purple-100 dark:border-purple-800">
                      <div className="flex items-center mb-4">
                        {getGoalIcon(client.fitnessGoal || "")}
                        <h3 className="text-lg font-semibold ml-2">
                          Fitness Goal
                        </h3>
                      </div>
                      <div className="text-3xl lg:text-2xl font-bold text-purple-700 dark:text-purple-300">
                        {formatFitnessGoal(client.fitnessGoal || "N/A")}
                      </div>
                      <p className="mt-2 lg:mt-3 text-gray-600 dark:text-gray-300">
                        {client.fitnessGoal === "weightLoss" &&
                          "Focused on reducing body fat and improving overall health."}
                        {client.fitnessGoal === "muscleGain" &&
                          "Building strength and increasing muscle mass."}
                        {client.fitnessGoal === "endurance" &&
                          "Improving stamina and cardiovascular health."}
                        {client.fitnessGoal === "flexibility" &&
                          "Enhancing range of motion and preventing injuries."}
                        {client.fitnessGoal === "maintenance" &&
                          "Maintaining current fitness level and overall health."}
                        {!client.fitnessGoal &&
                          "No specific fitness goal defined."}
                      </p>
                    </div>
                  </MotionItem>

                  <MotionItem>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                      <div className="flex items-center mb-4">
                        <Dumbbell className="w-5 h-5 text-purple-500" />
                        <h3 className="text-lg font-semibold ml-2">
                          Experience Level
                        </h3>
                      </div>
                      <div className="flex items-center">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center ${getExperienceLevelColor(
                            client.experienceLevel || "N/A"
                          )}`}
                        >
                          <span className="text-lg lg:text-xl font-bold">
                            {client.experienceLevel === "beginner" && "B"}
                            {client.experienceLevel === "intermediate" && "I"}
                            {client.experienceLevel === "advanced" && "A"}
                            {client.experienceLevel === "expert" && "E"}
                            {!client.experienceLevel && "N/A"}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-xl font-semibold">
                            {formatExperienceLevel(
                              client.experienceLevel || "N/A"
                            )}
                          </div>
                          <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300 mt-1 lg:mt-2">
                            {client.experienceLevel === "beginner" &&
                              "New to fitness training, learning the basics."}
                            {client.experienceLevel === "intermediate" &&
                              "Familiar with training, building consistency."}
                            {client.experienceLevel === "advanced" &&
                              "Experienced with training, refining techniques."}
                            {client.experienceLevel === "expert" &&
                              "Highly skilled, focusing on optimization."}
                            {!client.experienceLevel &&
                              "Experience level not specified."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </MotionItem>

                  <MotionItem>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                      <div className="flex items-center mb-4">
                        <ActivitySquare className="w-5 h-5 text-purple-500" />
                        <h3 className="text-lg font-semibold ml-2">
                          Preferred Workout
                        </h3>
                      </div>
                      <div className="text-xl font-semibold">
                        {client.preferredWorkout || "No preference specified"}
                      </div>
                      <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300 mt-1 lg:mt-2">
                        {client.preferredWorkout === "Cardio" &&
                          "Focuses on heart rate elevation and endurance."}
                        {client.preferredWorkout === "Meditation" &&
                          "Focuses on mental clarity and stress reduction."}
                        {client.preferredWorkout === "Pilates" &&
                          "Focuses on core strength and body control."}
                        {client.preferredWorkout === "Yoga" &&
                          "Focuses on flexibility, strength, and mindfulness."}
                        {client.preferredWorkout === "Calisthenics" &&
                          "Focuses on bodyweight exercises and functional movement."}
                        {!client.preferredWorkout &&
                          "No specific workout preference defined."}
                      </p>
                    </div>
                  </MotionItem>

                  <MotionItem>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                      <div className="flex items-center mb-4">
                        <Activity className="w-5 h-5 text-purple-500" />
                        <h3 className="text-lg font-semibold ml-2">
                          Activity Level
                        </h3>
                      </div>
                      <div className="text-xl font-semibold">
                        {formatActivityLevel(client.activityLevel || "N/A")}
                      </div>
                      <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300 mt-1 lg:mt-2">
                        {client.activityLevel === "sedentary" &&
                          "Little to no regular physical activity."}
                        {client.activityLevel === "light" &&
                          "Light exercise 1-3 days per week."}
                        {client.activityLevel === "moderate" &&
                          "Moderate exercise 3-5 days per week."}
                        {client.activityLevel === "active" &&
                          "Active exercise 5-7 days per week."}
                        {client.activityLevel === "veryActive" &&
                          "Very active with intense exercise daily."}
                        {!client.activityLevel &&
                          "Activity level not specified."}
                      </p>
                    </div>
                  </MotionItem>
                </div>
              </TabsContent>

              <TabsContent value="health" className="p-6 lg:p-8 pt-4 lg:pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 lg:gap-6 max-w-full lg:max-w-6xl lg:mx-auto">
                  <MotionItem>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                      <div className="flex items-center mb-4">
                        <Utensils className="w-5 h-5 text-purple-500" />
                        <h3 className="text-lg font-semibold ml-2">
                          Diet Preference
                        </h3>
                      </div>
                      <div className="text-xl font-semibold">
                        {formatDietPreference(client.dietPreference || "N/A")}
                      </div>
                      <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300 mt-1 lg:mt-2">
                        {client.dietPreference === "balanced" &&
                          "A well-rounded diet with all food groups."}
                        {client.dietPreference === "vegetarian" &&
                          "Excludes meat but may include dairy and eggs."}
                        {client.dietPreference === "vegan" &&
                          "Excludes all animal products."}
                        {client.dietPreference === "pescatarian" &&
                          "Includes fish but excludes other meats."}
                        {client.dietPreference === "highProtein" &&
                          "Emphasizes protein-rich foods."}
                        {client.dietPreference === "lowCarb" &&
                          "Limits carbohydrate intake."}
                        {client.dietPreference === "lowFat" &&
                          "Limits fat intake."}
                        {client.dietPreference === "glutenFree" &&
                          "Excludes gluten-containing foods."}
                        {client.dietPreference === "dairyFree" &&
                          "Excludes dairy products."}
                        {client.dietPreference === "sugarFree" &&
                          "Limits added sugars."}
                        {client.dietPreference === "keto" &&
                          "High fat, moderate protein, very low carb."}
                        {client.dietPreference === "noPreference" &&
                          "No specific dietary restrictions."}
                        {!client.dietPreference &&
                          "Diet preference not specified."}
                      </p>
                    </div>
                  </MotionItem>

                  <MotionItem>
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-6 border border-blue-100 dark:border-blue-800">
                      <div className="flex items-center mb-4">
                        <Droplet
                          className={`w-5 h-5 ${getWaterIntakeColor(
                            client.waterIntake || 0
                          )}`}
                        />
                        <h3 className="text-lg font-semibold ml-2">
                          Water Intake
                        </h3>
                      </div>
                      <div className="flex items-center justify-between mb-2 lg:mb-3">
                        <div className="text-3xl lg:text-2xl font-bold">
                          {client.waterIntake || 0}{" "}
                          <span className="text-sm lg:text-base font-normal text-gray-500 dark:text-gray-400">
                            ml
                          </span>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-sm lg:text-base font-medium ${getWaterIntakeColor(
                            client.waterIntake || 0
                          )} bg-opacity-10`}
                        >
                          {getWaterIntakeLevel(client.waterIntake || 0)}
                        </div>
                      </div>
                      <Progress
                        value={getWaterIntakePercentage(
                          client.waterIntake || 0
                        )}
                        className="h-3 bg-blue-100 dark:bg-blue-900/50"
                      />
                      <div className="flex justify-between mt-2 lg:mt-3 text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                        <span>0 ml</span>
                        <span>4000 ml</span>
                        <span>8000 ml</span>
                      </div>
                    </div>
                  </MotionItem>

                  <MotionItem>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                      <div className="flex items-center mb-4">
                        <Heart className="w-5 h-5 text-purple-500" />
                        <h3 className="text-lg font-semibold ml-2">
                          Health Conditions
                        </h3>
                      </div>
                      {client.healthConditions &&
                      client.healthConditions.length > 0 ? (
                        <div className="flex flex-wrap gap-2 lg:gap-3">
                          {client.healthConditions.map((condition, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
                            >
                              {formatHealthCondition(condition)}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-300">
                          No health conditions reported.
                        </p>
                      )}
                    </div>
                  </MotionItem>

                  <MotionItem>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-6 border border-indigo-100 dark:border-indigo-800">
                      <div className="flex items-center mb-4">
                        <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <h3 className="text-lg font-semibold ml-2">
                          Sleep Schedule
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                            Sleep Time
                          </div>
                          <div className="text-xl font-semibold">
                            {client.sleepFrom || "N/A"}
                          </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                            Wake Up Time
                          </div>
                          <div className="text-xl font-semibold">
                            {client.wakeUpAt || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </MotionItem>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default ClientDetailModal;