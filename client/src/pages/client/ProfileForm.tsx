"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelector } from "react-redux";
import {
  User,
  Phone,
  Mail,
  Ruler,
  Weight,
  Target,
  Dumbbell,
  Heart,
  Droplet,
  Save,
  Utensils,
  Activity,
  Sparkles,
} from "lucide-react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence, motion } from "framer-motion";
import { AnimatedTab, AnimatedItem } from "./ProfileMangement/TabAnimation";
import ProfileImageUploader from "@/components/common/ImageCropper/ProfileImageUploader";
import HealthConditions from "./ProfileMangement/HealthConditions";
import WaterIntake from "./ProfileMangement/WaterIntake";
import ResetPassword from "./ProfileMangement/ResetPassword";
import {
  profileFormSchema,
  type ProfileFormValues,
} from "@/utils/validations/profile.validator";
import { useUpdateClientProfile } from "@/services/client/useUpdateProfile";
import { useAllCategoryQuery } from "@/hooks/category/useAllCategory";
import { getAllCategoriesForClients } from "@/services/client/clientService";
import type { RootState } from "@/store/store";
import { useToaster } from "@/hooks/ui/useToaster";

// Mapping for API category titles to schema-compatible values
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
};

const ProfileForm: React.FC = () => {
  const [profileImage, setProfileImage] = useState<string | undefined>(
    undefined
  );
  const { successToast, errorToast } = useToaster();
  const clientData = useSelector((state: RootState) => state.client.client);
  const mutation = useUpdateClientProfile();

  // Fetch workout categories using useAllCategoryQuery
  const {
    data: categoryResponse,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useAllCategoryQuery(getAllCategoriesForClients);

  // Extract categories array from the response, with a fallback
  const categories = categoryResponse?.categories || [];

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      height: 170,
      weight: 70,
      fitnessGoal: "weightLoss",
      experienceLevel: "beginner",
      preferredWorkout: "Cardio",
      dietPreference: "balanced",
      activityLevel: "moderate",
      healthConditions: [],
      waterIntake: 2000,
      waterIntakeTarget: 2000,
      profileImage: "",
    },
  });

  // Debug fetched categories
  useEffect(() => {
    console.log("Fetched categories:", categories);
  }, [categories]);

  useEffect(() => {
    if (clientData) {
      // Normalize and map preferred workout
      const workoutKey = clientData.preferredWorkout?.toLowerCase();
      const mappedPreferredWorkout = workoutKey
        ? workoutTypeMapping[workoutKey]
        : "Cardio";

      const allowedWorkouts: ProfileFormValues["preferredWorkout"][] = [
        "Cardio",
        "Meditation",
        "Pilates",
        "Yoga",
        "Calisthenics",
      ];

      const safePreferredWorkout = allowedWorkouts.includes(
        mappedPreferredWorkout as any
      )
        ? (mappedPreferredWorkout as ProfileFormValues["preferredWorkout"])
        : "Cardio";

      // Validate diet preference
      const allowedDietPreferences: ProfileFormValues["dietPreference"][] = [
        "balanced",
        "vegetarian",
        "vegan",
        "pescatarian",
        "highProtein",
        "lowCarb",
        "lowFat",
        "glutenFree",
        "dairyFree",
        "sugarFree",
        "keto",
        "noPreference",
      ];

      const safeDietPreference = allowedDietPreferences.includes(
        clientData.dietPreference as ProfileFormValues["dietPreference"]
      )
        ? (clientData.dietPreference as ProfileFormValues["dietPreference"])
        : "balanced";

      const newProfileImage = clientData.profileImage || "";

      form.reset({
        firstName: clientData.firstName || "",
        lastName: clientData.lastName || "",
        email: clientData.email || "",
        phoneNumber: clientData.phoneNumber || "",
        height: clientData.height ?? 170,
        weight: clientData.weight ?? 70,
        fitnessGoal: clientData.fitnessGoal ?? "weightLoss",
        experienceLevel: clientData.experienceLevel ?? "beginner",
        preferredWorkout: safePreferredWorkout,
        dietPreference: safeDietPreference,
        activityLevel: clientData.activityLevel ?? "moderate",
        healthConditions: clientData.healthConditions ?? [],
        waterIntake: clientData.waterIntake ?? 2000,
        waterIntakeTarget: clientData.waterIntakeTarget ?? 2000,
        profileImage: newProfileImage,
      });

      setProfileImage(newProfileImage);
    }
  }, [clientData, form]);

  useEffect(() => {
    console.log("Fetched categories:", categories);
  }, [categories]);

  const handleImageChange = (newImage: string | null) => {
    const imageUrl = newImage || undefined;
    setProfileImage(imageUrl);
    form.setValue("profileImage", imageUrl || "");
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!clientData?.id) {
      errorToast("User ID not found");
      return;
    }

    const apiData = {
      ...data,
      fitnessGoal: data.fitnessGoal || undefined,
      experienceLevel: data.experienceLevel || undefined,
      preferredWorkout: data.preferredWorkout || undefined,
      activityLevel: data.activityLevel || undefined,
      height: data.height ?? undefined,
      weight: data.weight ?? undefined,
      waterIntake: data.waterIntake ?? undefined,
      waterIntakeTarget: data.waterIntakeTarget ?? undefined,
      profileImage: profileImage,
      id: clientData.id,
    };

    try {
      await mutation.mutateAsync(apiData);
      successToast("Profile updated successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update profile";
      errorToast(errorMessage);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full min-h-screen bg-white pt-20 px-4 relative overflow-hidden"
    >
      <div className="max-w-screen-xl mx-auto relative z-10">
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#6d28d9] to-[#a21caf] bg-clip-text text-transparent tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-[var(--violet)]" />
            {clientData
              ? `Welcome, ${clientData.firstName}!`
              : "Profile Settings"}
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage your account settings and preferences
          </p>
        </motion.div>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6 bg-gray-100 shadow-md rounded-full p-1">
            <TabsTrigger
              value="personal"
              className="text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6d28d9] data-[state=active]:to-[#a21caf] data-[state=active]:text-white hover:bg-gray-200 rounded-full transition-all duration-300"
            >
              <User className="h-4 w-4 mr-2" />
              Personal Info
            </TabsTrigger>
            <TabsTrigger
              value="fitness"
              className="text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6d28d9] data-[state=active]:to-[#a21caf] data-[state=active]:text-white hover:bg-gray-200 rounded-full transition-all duration-300"
            >
              <Activity className="h-4 w-4 mr-2" />
              Fitness & Health
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="text-gray-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6d28d9] data-[state=active]:to-[#a21caf] data-[state=active]:text-white hover:bg-gray-200 rounded-full transition-all duration-300"
            >
              <Heart className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <AnimatedTab tabKey="personal-tab">
              <TabsContent value="personal" className="space-y-5">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <AnimatedItem>
                        <Card className="md:col-span-1 bg-white shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg bg-gradient-to-r from-[#6d28d9] to-[#a21caf] bg-clip-text text-transparent">
                              <User className="h-4 w-4 text-[#4A1D96]" />
                              <span>Profile Picture</span>
                            </CardTitle>
                            <CardDescription className="text-xs text-[#6B4F9E]">
                              Upload a photo for your profile
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ProfileImageUploader
                              initialImage={profileImage}
                              onCropComplete={handleImageChange}
                            />
                          </CardContent>
                        </Card>
                      </AnimatedItem>

                      <AnimatedItem className="md:col-span-2">
                        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg bg-gradient-to-r from-[#6d28d9] to-[#a21caf] bg-clip-text text-transparent">
                              <User className="h-4 w-4 text-[var(--violet)]" />
                              <span>Personal Information</span>
                            </CardTitle>
                            <CardDescription className="text-xs text-[var(--muted-foreground)]">
                              Your basic personal details
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs font-medium text-[#6d28d9]">
                                      First Name
                                    </FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--violet)]" />
                                        <Input
                                          placeholder="First Name"
                                          {...field}
                                          className="pl-8 h-9 text-sm border-[var(--input)] focus:ring-[var(--violet)] focus:border-[var(--violet)]"
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage className="text-xs mt-1 text-[var(--destructive)]" />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs font-medium text-[#6d28d9]">
                                      Last Name
                                    </FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--violet)]" />
                                        <Input
                                          placeholder="Last Name"
                                          {...field}
                                          className="pl-8 h-9 text-sm border-[var(--input)] focus:ring-[var(--violet)] focus:border-[var(--violet)]"
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage className="text-xs mt-1 text-[var(--destructive)]" />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs font-medium text-[#6d28d9]">
                                    Email
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--violet)]" />
                                      <Input
                                        type="email"
                                        placeholder="Email"
                                        {...field}
                                        readOnly
                                        className="pl-8 h-9 text-sm border-[var(--input)] focus:ring-[var(--violet)] focus:border-[var(--violet)] bg-gray-50 cursor-not-allowed"
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage className="text-xs mt-1 text-[var(--destructive)]" />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="phoneNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs font-medium text-[#6d28d9]">
                                    Phone Number
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Phone className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--violet)]" />
                                      <Input
                                        placeholder="Phone Number"
                                        {...field}
                                        className="pl-8 h-9 text-sm border-[var(--input)] focus:ring-[var(--violet)] focus:border-[var(--violet)]"
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage className="text-xs mt-1 text-[var(--destructive)]" />
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </Card>
                      </AnimatedItem>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          type="submit"
                          className="gap-2 h-9 px-4 bg-gradient-to-r from-[#6d28d9] to-[#a21caf] hover:from-[#5b21b6] hover:to-[#86198f] text-white shadow-md"
                          disabled={mutation.isPending}
                        >
                          {mutation.isPending ? (
                            <>
                              <span className="animate-spin h-3.5 w-3.5 border-2 border-[var(--primary-foreground)] border-t-transparent rounded-full" />
                              <span className="text-sm">Saving...</span>
                            </>
                          ) : (
                            <>
                              <Save className="h-3.5 w-3.5" />
                              <span className="text-sm">Save Changes</span>
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </div>
                  </form>
                </Form>
              </TabsContent>
            </AnimatedTab>

            <AnimatedTab tabKey="fitness-tab">
              <TabsContent value="fitness" className="space-y-5">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <AnimatedItem>
                          <Card className="h-full bg-white shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                            <CardHeader className="pb-3">
                              <CardTitle className="flex items-center gap-2 text-lg bg-gradient-to-r from-[#6d28d9] to-[#a21caf] bg-clip-text text-transparent">
                                <Ruler className="h-4 w-4 text-[var(--violet)]" />
                                <span>Physical Attributes</span>
                              </CardTitle>
                              <CardDescription className="text-xs text-[var(--muted-foreground)]">
                                Your physical measurements
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <FormField
                                  control={form.control}
                                  name="height"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs font-medium text-[#6d28d9]">
                                        Height (cm)
                                      </FormLabel>
                                      <FormControl>
                                        <div className="relative">
                                          <Ruler className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--violet)]" />
                                          <Input
                                            type="number"
                                            {...field}
                                            value={field.value ?? ""}
                                            onChange={(e) =>
                                              field.onChange(
                                                e.target.value
                                                  ? Number(e.target.value)
                                                  : undefined
                                              )
                                            }
                                            className="pl-8 h-9 text-sm border-[var(--input)] focus:ring-[var(--violet)] focus:border-[var(--violet)]"
                                          />
                                        </div>
                                      </FormControl>
                                      <FormMessage className="text-xs mt-1 text-[var(--destructive)]" />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="weight"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs font-medium text-[#6d28d9]">
                                        Weight (kg)
                                      </FormLabel>
                                      <FormControl>
                                        <div className="relative">
                                          <Weight className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--violet)]" />
                                          <Input
                                            type="number"
                                            {...field}
                                            value={field.value ?? ""}
                                            onChange={(e) =>
                                              field.onChange(
                                                e.target.value
                                                  ? Number(e.target.value)
                                                  : undefined
                                              )
                                            }
                                            className="pl-8 h-9 text-sm border-[var(--input)] focus:ring-[var(--violet)] focus:border-[var(--violet)]"
                                          />
                                        </div>
                                      </FormControl>
                                      <FormMessage className="text-xs mt-1 text-[var(--destructive)]" />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        </AnimatedItem>

                        <AnimatedItem>
                          <Card className="h-full bg-white shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                            <CardHeader className="pb-3">
                              <CardTitle className="flex items-center gap-2 text-lg bg-gradient-to-r from-[#6d28d9] to-[#a21caf] bg-clip-text text-transparent">
                                <Target className="h-4 w-4 text-[var(--violet)]" />
                                <span>Fitness Goals</span>
                              </CardTitle>
                              <CardDescription className="text-xs text-[var(--muted-foreground)]">
                                Your fitness objectives
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <FormField
                                  control={form.control}
                                  name="fitnessGoal"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs font-medium text-[#6d28d9]">
                                        Fitness Goal
                                      </FormLabel>
                                      <FormControl>
                                        <Select
                                          onValueChange={field.onChange}
                                          value={field.value}
                                        >
                                          <SelectTrigger className="border-[var(--input)] focus:ring-[var(--violet)] focus:border-[var(--violet)] h-9 pl-8">
                                            <Target className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--violet)]" />
                                            <SelectValue placeholder="Select a fitness goal" />
                                          </SelectTrigger>
                                          <SelectContent className="bg-[var(--popover)] text-[var(--popover-foreground)]">
                                            <SelectItem value="weightLoss">
                                              Weight Loss
                                            </SelectItem>
                                            <SelectItem value="muscleGain">
                                              Muscle Gain
                                            </SelectItem>
                                            <SelectItem value="endurance">
                                              Endurance
                                            </SelectItem>
                                            <SelectItem value="flexibility">
                                              Flexibility
                                            </SelectItem>
                                            <SelectItem value="maintenance">
                                              Maintenance
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </FormControl>
                                      <FormMessage className="text-xs mt-1 text-[var(--destructive)]" />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="experienceLevel"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs font-medium text-[#6d28d9]">
                                        Experience Level
                                      </FormLabel>
                                      <FormControl>
                                        <Select
                                          onValueChange={field.onChange}
                                          value={field.value}
                                        >
                                          <SelectTrigger className="border-[var(--input)] focus:ring-[var(--violet)] focus:border-[var(--violet)] h-9 pl-8">
                                            <Activity className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--violet)]" />
                                            <SelectValue placeholder="Select experience level" />
                                          </SelectTrigger>
                                          <SelectContent className="bg-[var(--popover)] text-[var(--popover-foreground)]">
                                            <SelectItem value="beginner">
                                              Beginner
                                            </SelectItem>
                                            <SelectItem value="intermediate">
                                              Intermediate
                                            </SelectItem>
                                            <SelectItem value="advanced">
                                              Advanced
                                            </SelectItem>
                                            <SelectItem value="expert">
                                              Expert
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </FormControl>
                                      <FormMessage className="text-xs mt-1 text-[var(--destructive)]" />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        </AnimatedItem>
                      </div>

                      <AnimatedItem>
                        <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg bg-gradient-to-r from-[#6d28d9] to-[#a21caf] bg-clip-text text-transparent">
                              <Dumbbell className="h-4 w-4 text-[var(--violet)]" />
                              <span>Workout Preferences</span>
                            </CardTitle>
                            <CardDescription className="text-xs text-[var(--muted-foreground)]">
                              Your preferred workout styles
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <FormField
                                control={form.control}
                                name="preferredWorkout"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs font-medium text-[#6d28d9]">
                                      Preferred Workout
                                    </FormLabel>
                                    <FormControl>
                                      <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                      >
                                        <SelectTrigger className="border-[var(--input)] focus:ring-[var(--violet)] focus:border-[var(--violet)] h-9 pl-8">
                                          <Dumbbell className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--violet)]" />
                                          <SelectValue placeholder="Select workout type" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[var(--popover)] text-[var(--popover-foreground)]">
                                          {categoriesLoading ? (
                                            <SelectItem value="" disabled>
                                              Loading categories...
                                            </SelectItem>
                                          ) : categoriesError ? (
                                            <SelectItem value="" disabled>
                                              Error loading categories
                                            </SelectItem>
                                          ) : categories.length > 0 ? (
                                            categories
                                              .filter((category) => {
                                                const normalizedTitle =
                                                  category.title.toLowerCase();
                                                return Object.keys(
                                                  workoutTypeMapping
                                                ).some(
                                                  (key) =>
                                                    key.toLowerCase() ===
                                                    normalizedTitle
                                                );
                                              })
                                              .map((category) => {
                                                const normalizedTitle =
                                                  category.title.toLowerCase();
                                                const schemaValue =
                                                  Object.entries(
                                                    workoutTypeMapping
                                                  ).find(
                                                    ([key]) =>
                                                      key.toLowerCase() ===
                                                      normalizedTitle
                                                  )?.[1] || "Cardio";

                                                return (
                                                  <SelectItem
                                                    key={category._id}
                                                    value={schemaValue}
                                                  >
                                                    {category.title}
                                                  </SelectItem>
                                                );
                                              })
                                          ) : (
                                            <SelectItem value="Cardio">
                                              Default: Cardio
                                            </SelectItem>
                                          )}
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <FormMessage className="text-xs mt-1 text-[var(--destructive)]" />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="activityLevel"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs font-medium text-[#6d28d9]">
                                      Activity Level
                                    </FormLabel>
                                    <FormControl>
                                      <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                      >
                                        <SelectTrigger className="border-[var(--input)] focus:ring-[var(--violet)] focus:border-[var(--violet)] h-9 pl-8">
                                          <Activity className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--violet)]" />
                                          <SelectValue placeholder="Select activity level" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[var(--popover)] text-[var(--popover-foreground)]">
                                          <SelectItem value="sedentary">
                                            Sedentary
                                          </SelectItem>
                                          <SelectItem value="light">
                                            Light
                                          </SelectItem>
                                          <SelectItem value="moderate">
                                            Moderate
                                          </SelectItem>
                                          <SelectItem value="active">
                                            Active
                                          </SelectItem>
                                          <SelectItem value="veryActive">
                                            Very Active
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <FormMessage className="text-xs mt-1 text-[var(--destructive)]" />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name="dietPreference"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs font-medium text-[#6d28d9]">
                                    Diet Preference
                                  </FormLabel>
                                  <FormControl>
                                    <Select
                                      onValueChange={field.onChange}
                                      value={field.value}
                                    >
                                      <SelectTrigger className="border-[var(--input)] focus:ring-[var(--violet)] focus:border-[var(--violet)] h-9 pl-8">
                                        <Utensils className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--violet)]" />
                                        <SelectValue placeholder="Select diet preference" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-[var(--popover)] text-[var(--popover-foreground)]">
                                        <SelectItem value="balanced">
                                          Normal / Balanced Diet
                                        </SelectItem>
                                        <SelectItem value="vegetarian">
                                          Vegetarian
                                        </SelectItem>
                                        <SelectItem value="vegan">
                                          Vegan
                                        </SelectItem>
                                        <SelectItem value="pescatarian">
                                          Pescatarian
                                        </SelectItem>
                                        <SelectItem value="highProtein">
                                          High Protein
                                        </SelectItem>
                                        <SelectItem value="lowCarb">
                                          Low Carb
                                        </SelectItem>
                                        <SelectItem value="lowFat">
                                          Low Fat
                                        </SelectItem>
                                        <SelectItem value="glutenFree">
                                          Gluten-Free
                                        </SelectItem>
                                        <SelectItem value="dairyFree">
                                          Dairy-Free
                                        </SelectItem>
                                        <SelectItem value="sugarFree">
                                          Sugar-Free
                                        </SelectItem>
                                        <SelectItem value="keto">
                                          Keto
                                        </SelectItem>
                                        <SelectItem value="noPreference">
                                          No Preference
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage className="text-xs mt-1 text-[var(--destructive)]" />
                                </FormItem>
                              )}
                            />
                          </CardContent>
                        </Card>
                      </AnimatedItem>
                    </div>

                    <div className="mt-8 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <AnimatedItem>
                          <Card className="h-full bg-white shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                            <CardHeader className="pb-3">
                              <CardTitle className="flex items-center gap-2 text-lg bg-gradient-to-r from-[#6d28d9] to-[#a21caf] bg-clip-text text-transparent">
                                <Heart className="h-4 w-4 text-[var(--violet)]" />
                                <span>Health Conditions</span>
                              </CardTitle>
                              <CardDescription className="text-xs text-[var(--muted-foreground)]">
                                Select any health conditions you have
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <FormField
                                control={form.control}
                                name="healthConditions"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <HealthConditions
                                        initialConditions={field.value || []}
                                        onConditionsChange={field.onChange}
                                      />
                                    </FormControl>
                                    <FormMessage className="text-xs mt-1 text-[var(--destructive)]" />
                                  </FormItem>
                                )}
                              />
                            </CardContent>
                          </Card>
                        </AnimatedItem>

                        <AnimatedItem>
                          <Card className="h-full bg-white shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                            <CardHeader className="pb-3">
                              <CardTitle className="flex items-center gap-2 text-lg bg-gradient-to-r from-[#6d28d9] to-[#a21caf] bg-clip-text text-transparent">
                                <Droplet className="h-4 w-4 text-[var(--violet)]" />
                                <span>Water Intake</span>
                              </CardTitle>
                              <CardDescription className="text-xs text-[var(--muted-foreground)]">
                                Track your daily water consumption
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <FormField
                                control={form.control}
                                name="waterIntake"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <WaterIntake
                                        value={field.value ?? 0}
                                        targetValue={form.watch("waterIntakeTarget") ?? 2000}
                                        onChange={(value) =>
                                          field.onChange(value ?? undefined)
                                        }
                                        onTargetChange={(value) =>
                                          form.setValue("waterIntakeTarget", value ?? undefined)
                                        }
                                      />
                                    </FormControl>
                                    <FormMessage className="text-xs mt-1 text-[var(--destructive)]" />
                                  </FormItem>
                                )}
                              />
                            </CardContent>
                          </Card>
                        </AnimatedItem>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          type="submit"
                          className="gap-2 h-9 px-4 bg-gradient-to-r from-[#6d28d9] to-[#a21caf] hover:from-[#5b21b6] hover:to-[#86198f] text-white shadow-md"
                          disabled={mutation.isPending}
                        >
                          {mutation.isPending ? (
                            <>
                              <span className="animate-spin h-3.5 w-3.5 border-2 border-[var(--primary-foreground)] border-t-transparent rounded-full" />
                              <span className="text-sm">Saving...</span>
                            </>
                          ) : (
                            <>
                              <Save className="h-3.5 w-3.5" />
                              <span className="text-sm">Save Changes</span>
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </div>
                  </form>
                </Form>
              </TabsContent>
            </AnimatedTab>

            <AnimatedTab tabKey="security-tab">
              <TabsContent value="security">
                <AnimatedItem>
                  <ResetPassword />
                </AnimatedItem>
              </TabsContent>
            </AnimatedTab>
          </AnimatePresence>
        </Tabs>
      </div>
    </motion.div>
  );
};

export default ProfileForm;
