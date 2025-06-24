"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaDumbbell,
  FaUtensils,
  FaRocket,
  FaChartLine,
  FaHeartbeat,
  FaAppleAlt,
  FaRunning,
  FaWeight,
  FaCheck,
} from "react-icons/fa";
import { usePlanMutations } from "@/hooks/client/useAi";
import { useWorkoutPlans, useDietPlans } from "@/hooks/client/useClientPlans";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToaster } from "@/hooks/ui/useToaster";
import { FitnessImage } from "./AiGenerator/FitnessImage";
import { FeatureCards } from "./AiGenerator/FeatureCards";
import { LoadingModal } from "./AiGenerator/LoadingModal";
import { PlanDisplay } from "./PlanDisplay";

export default function PlanGenerator() {
  const [activeTab, setActiveTab] = useState<"workout" | "diet">("workout");
  const [showSuccess, setShowSuccess] = useState(false);

  const { successToast, errorToast } = useToaster(); 
  const {
    generateWorkout,
    generateDiet,
    isGeneratingWorkout,
    isGeneratingDiet,
  } = usePlanMutations();
  const { data: workoutPlans, isLoading: workoutLoading } = useWorkoutPlans();
  const { data: dietPlans, isLoading: dietLoading } = useDietPlans();

  const handleGenerate = async () => {
    try {
      if (activeTab === "workout") {
        await generateWorkout({});
        console.log('Workout generated successfully'); // Debug log
      } else {
        await generateDiet({});
        console.log('Diet generated successfully'); // Debug log
      }
      successToast(
        `${
          activeTab === "workout" ? "Workout" : "Diet"
        } plan generated successfully!`
      );
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : (err as any)?.response?.data?.message || "Failed to generate plan";
      errorToast(errorMessage);
    }
  };

  const isLoading =
    activeTab === "workout"
      ? isGeneratingWorkout || workoutLoading
      : isGeneratingDiet || dietLoading;
  const latestPlan =
    activeTab === "workout"
      ? workoutPlans?.[workoutPlans.length - 1] || null
      : dietPlans?.[dietPlans.length - 1] || null;

  const workoutFeatures = [
    {
      icon: (
        <FaHeartbeat className="group-hover:text-[#c026d3] transition-colors duration-300" />
      ),
      title: "Strength & Cardio",
      description: "Balanced approach",
      color: "var(--violet)",
      bgColor: "#ede9fe",
    },
    {
      icon: (
        <FaRunning className="group-hover:text-[#c026d3] transition-colors duration-300" />
      ),
      title: "Progressive",
      description: "Adapts to your level",
      color: "var(--violet)",
      bgColor: "#ede9fe",
    },
    {
      icon: (
        <FaChartLine className="group-hover:text-[#c026d3] transition-colors duration-300" />
      ),
      title: "Results Focused",
      description: "Track your progress",
      color: "var(--violet)",
      bgColor: "#ede9fe",
    },
  ];

  const dietFeatures = [
    {
      icon: (
        <FaAppleAlt className="group-hover:text-[#f97316] transition-colors duration-300" />
      ),
      title: "Nutrient Dense",
      description: "Wholesome foods",
      color: "#f43f5e",
      bgColor: "#ffe4e6",
    },
    {
      icon: (
        <FaWeight className="group-hover:text-[#f97316] transition-colors duration-300" />
      ),
      title: "Macro Balanced",
      description: "Optimal ratios",
      color: "#f43f5e",
      bgColor: "#ffe4e6",
    },
    {
      icon: (
        <FaCheck className="group-hover:text-[#f97316] transition-colors duration-300" />
      ),
      title: "Sustainable",
      description: "Long-term success",
      color: "#f43f5e",
      bgColor: "#ffe4e6",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-16 space-y-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#6d28d9] to-[#a21caf] bg-clip-text text-transparent">
            Galaxy Fitness Planner
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get personalized workout and diet plans tailored to your fitness
            goals, body type, and preferences. Our AI analyzes thousands of
            successful fitness programs to create the perfect plan for you.
          </p>
        </motion.div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "workout" | "diet")}
          className="max-w-5xl mx-auto"
        >
          <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-gray-100 rounded-full">
            <TabsTrigger
              value="workout"
              className="flex items-center gap-2 py-3 rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6d28d9] data-[state=active]:to-[#a21caf] data-[state=active]:text-white transition-all duration-300"
            >
              <FaDumbbell className="h-4 w-4" />
              <span className="font-medium">Workout Plan</span>
            </TabsTrigger>
            <TabsTrigger
              value="diet"
              className="flex items-center gap-2 py-3 rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#e11d48] data-[state=active]:to-[#f97316] data-[state=active]:text-white transition-all duration-300"
            >
              <FaUtensils className="h-4 w-4" />
              <span className="font-medium">Diet Plan</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workout">
            <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-[#f5f3ff] to-[#fae8ff] rounded-3xl">
              <LoadingModal
                isLoading={isLoading}
                showSuccess={showSuccess}
                type="workout"
                icon={<FaDumbbell />}
              />
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="p-8 md:w-1/2 relative">
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                      <div className="absolute w-40 h-40 rounded-full bg-[var(--violet)] -top-10 -left-10 animate-blob" />
                      <div className="absolute w-40 h-40 rounded-full bg-[#c026d3] top-40 left-40 animate-blob animation-delay-2000" />
                      <div className="absolute w-40 h-40 rounded-full bg-[var(--violet)] bottom-10 right-10 animate-blob animation-delay-4000" />
                    </div>

                    <div className="relative z-10">
                      <h3 className="text-2xl font-bold text-[#5b21b6] mb-4">
                        Workout Plan Generator
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Create a personalized workout routine based on your
                        fitness level, goals, and available equipment. Our AI
                        will design a progressive plan to help you build
                        strength, endurance, and achieve your ideal physique.
                      </p>

                      <FeatureCards features={workoutFeatures} />

                      <div className="flex justify-center">
                        <Button
                          onClick={handleGenerate}
                          size="lg"
                          disabled={isLoading || showSuccess}
                          className="bg-gradient-to-r from-[var(--violet)] to-[#c026d3] hover:from-[#7c3aed] hover:to-[#a21caf] text-white font-medium px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-lg h-auto relative overflow-hidden group"
                        >
                          <span className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                          <FaRocket className="mr-2" />
                          Generate Workout Plan
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="md:w-1/2 relative">
                    <FitnessImage type="workout" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diet">
            <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-[#fff1f2] to-[#ffedd5] rounded-3xl">
              <LoadingModal
                isLoading={isLoading}
                showSuccess={showSuccess}
                type="diet"
                icon={<FaUtensils />}
              />
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="p-8 md:w-1/2 relative">
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                      <div className="absolute w-40 h-40 rounded-full bg-[#f43f5e] -top-10 -left-10 animate-blob" />
                      <div className="absolute w-40 h-40 rounded-full bg-[#fb923c] top-40 left-40 animate-blob animation-delay-2000" />
                      <div className="absolute w-40 h-40 rounded-full bg-[#f43f5e] bottom-10 right-10 animate-blob animation-delay-4000" />
                    </div>

                    <div className="relative z-10">
                      <h3 className="text-2xl font-bold text-[#9f1239] mb-4">
                        Diet Plan Generator
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Get a custom nutrition plan tailored to your body type,
                        dietary preferences, and fitness goals. Our AI creates
                        balanced meal plans with precise macronutrient ratios to
                        fuel your performance.
                      </p>

                      <FeatureCards features={dietFeatures} />

                      <div className="flex justify-center">
                        <Button
                          onClick={handleGenerate}
                          size="lg"
                          disabled={isLoading || showSuccess}
                          className="bg-gradient-to-r from-[#f43f5e] to-[#f97316] hover:from-[#e11d48] hover:to-[#ea580c] text-white font-medium px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-lg h-auto relative overflow-hidden group"
                        >
                          <span className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                          <FaRocket className="mr-2" />
                          Generate Diet Plan
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="md:w-1/2 relative">
                    <FitnessImage type="diet" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {latestPlan && <PlanDisplay plan={latestPlan} type={activeTab} />}
      </div>
    </div>
  );
}
