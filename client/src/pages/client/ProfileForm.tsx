"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelector } from "react-redux";
import { User, Phone, Mail, Ruler, Weight, Target, Dumbbell, Heart, Droplet, Save } from "lucide-react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence } from "framer-motion";
import { AnimatedTab, AnimatedItem } from "./ProfileMangement/TabAnimation";
import ProfileImage from "./ProfileMangement/ProfileImage";
import HealthConditions from "./ProfileMangement/HealthConditions";
import WaterIntake from "./ProfileMangement/WaterIntake";
import ResetPassword from "./ProfileMangement/ResetPassword";
import { profileFormSchema, type ProfileFormValues, healthConditionsList } from "@/utils/validations/profile.validator";
import { useUpdateClientProfile } from "@/services/client/useUpdateProfile";
import type { RootState } from "@/store/store";
import { useToaster } from "@/hooks/ui/useToaster";
const ProfileForm: React.FC = () => {
  const [profileImage, setProfileImage] = React.useState<string | undefined>(undefined);
  const { successToast, errorToast } = useToaster();
  const clientData = useSelector((state: RootState) => state.client.client);
  const mutation = useUpdateClientProfile();

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
      preferredWorkout: "cardio",
      dietPreference: "balanced",
      activityLevel: "moderate",
      healthConditions: [],
      waterIntake: 2000,
    },
  });

  useEffect(() => {
    if (clientData) {
      form.reset({
        firstName: clientData.firstName || "",
        lastName: clientData.lastName || "",
        email: clientData.email || "",
        profileImage: clientData.profileImage || "",
        phoneNumber: clientData.phoneNumber || "",
        height: clientData.height ?? 170,
        weight: clientData.weight ?? 70,
        fitnessGoal: clientData.fitnessGoal ?? "weightLoss",
        experienceLevel: clientData.experienceLevel ?? "beginner",
        preferredWorkout:
          (clientData.preferredWorkout as "cardio" | "strength" | "hiit" | "yoga" | "pilates" | "crossfit") || "cardio",
        dietPreference: clientData.dietPreference ?? "balanced",
        activityLevel: clientData.activityLevel ?? "moderate",
        healthConditions: clientData.healthConditions ?? [],
        waterIntake: clientData.waterIntake ?? 2000,
      });
      setProfileImage(clientData.profileImage);
    }
  }, [clientData, form]);

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
      profileImage,
      id: clientData.id,
    };

    try {
      await mutation.mutateAsync(apiData);
      successToast("Profile updated successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
      errorToast(errorMessage);
    }
  };

  return (
    <div className="pt-16 px-4 md:px-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {clientData ? `Welcome, ${clientData.firstName}!` : "Profile Settings"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="fitness">Fitness & Health</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <AnimatedTab tabKey="personal-tab">
            <TabsContent value="personal" className="space-y-5">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <AnimatedItem>
                      <Card className="md:col-span-1">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <User className="h-4 w-4 text-primary" />
                            <span>Profile Picture</span>
                          </CardTitle>
                          <CardDescription className="text-xs">Upload a photo for your profile</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ProfileImage
                            initialImage={profileImage}
                            onImageChange={(image: string | null) => setProfileImage(image ?? undefined)}
                          />
                        </CardContent>
                      </Card>
                    </AnimatedItem>

                    <AnimatedItem className="md:col-span-2">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <User className="h-4 w-4 text-primary" />
                            <span>Personal Information</span>
                          </CardTitle>
                          <CardDescription className="text-xs">Your basic personal details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormField
                              control={form.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs font-medium">First Name</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                      <Input placeholder="First Name" {...field} className="pl-8 h-9 text-sm" />
                                    </div>
                                  </FormControl>
                                  <FormMessage className="text-xs mt-1" />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs font-medium">Last Name</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                      <Input placeholder="Last Name" {...field} className="pl-8 h-9 text-sm" />
                                    </div>
                                  </FormControl>
                                  <FormMessage className="text-xs mt-1" />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-medium">Email</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input type="email" placeholder="Email" {...field} className="pl-8 h-9 text-sm" />
                                  </div>
                                </FormControl>
                                <FormMessage className="text-xs mt-1" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-medium">Phone Number</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Phone className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input placeholder="Phone Number" {...field} className="pl-8 h-9 text-sm" />
                                  </div>
                                </FormControl>
                                <FormMessage className="text-xs mt-1" />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </AnimatedItem>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button type="submit" className="gap-2 h-9 px-4" disabled={mutation.isPending}>
                      {mutation.isPending ? (
                        <>
                          <span className="animate-spin h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full" />
                          <span className="text-sm">Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-3.5 w-3.5" />
                          <span className="text-sm">Save Changes</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
          </AnimatedTab>

          <AnimatedTab tabKey="fitness-tab">
            <TabsContent value="fitness" className="space-y-5">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <AnimatedItem>
                      <Card className="h-full">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Ruler className="h-4 w-4 text-primary" />
                            <span>Physical Attributes</span>
                          </CardTitle>
                          <CardDescription className="text-xs">Your physical measurements</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={form.control}
                              name="height"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs font-medium">Height (cm)</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Ruler className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                      <Input
                                        type="number"
                                        {...field}
                                        value={field.value ?? ""}
                                        onChange={(e) =>
                                          field.onChange(e.target.value ? Number(e.target.value) : undefined)
                                        }
                                        className="pl-8 h-9 text-sm"
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage className="text-xs mt-1" />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="weight"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs font-medium">Weight (kg)</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Weight className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                      <Input
                                        type="number"
                                        {...field}
                                        value={field.value ?? ""}
                                        onChange={(e) =>
                                          field.onChange(e.target.value ? Number(e.target.value) : undefined)
                                        }
                                        className="pl-8 h-9 text-sm"
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage className="text-xs mt-1" />
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </AnimatedItem>

                    <AnimatedItem>
                      <Card className="h-full">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Target className="h-4 w-4 text-primary" />
                            <span>Fitness Goals</span>
                          </CardTitle>
                          <CardDescription className="text-xs">Your fitness objectives</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={form.control}
                              name="fitnessGoal"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs font-medium">Fitness Goal</FormLabel>
                                  <FormControl>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <SelectTrigger size="lg">
                                        <SelectValue placeholder="Select a fitness goal" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="weightLoss">Weight Loss</SelectItem>
                                        <SelectItem value="muscleGain">Muscle Gain</SelectItem>
                                        <SelectItem value="endurance">Endurance</SelectItem>
                                        <SelectItem value="flexibility">Flexibility</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage className="text-xs mt-1" />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="experienceLevel"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs font-medium">Experience Level</FormLabel>
                                  <FormControl>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <SelectTrigger size="lg">
                                        <SelectValue placeholder="Select experience level" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="beginner">Beginner</SelectItem>
                                        <SelectItem value="intermediate">Intermediate</SelectItem>
                                        <SelectItem value="advanced">Advanced</SelectItem>
                                        <SelectItem value="expert">Expert</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage className="text-xs mt-1" />
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </AnimatedItem>
                  </div>

                  <AnimatedItem>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Dumbbell className="h-4 w-4 text-primary" />
                          <span>Workout Preferences</span>
                        </CardTitle>
                        <CardDescription className="text-xs">Your preferred workout styles</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <FormField
                            control={form.control}
                            name="preferredWorkout"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-medium">Preferred Workout</FormLabel>
                                <FormControl>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger size="lg">
                                      <SelectValue placeholder="Select workout type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="cardio">Cardio</SelectItem>
                                      <SelectItem value="strength">Strength</SelectItem>
                                      <SelectItem value="hiit">HIIT</SelectItem>
                                      <SelectItem value="yoga">Yoga</SelectItem>
                                      <SelectItem value="pilates">Pilates</SelectItem>
                                      <SelectItem value="crossfit">CrossFit</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage className="text-xs mt-1" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="activityLevel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-medium">Activity Level</FormLabel>
                                <FormControl>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger size="lg">
                                      <SelectValue placeholder="Select activity level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="sedentary">Sedentary</SelectItem>
                                      <SelectItem value="light">Light</SelectItem>
                                      <SelectItem value="moderate">Moderate</SelectItem>
                                      <SelectItem value="active">Active</SelectItem>
                                      <SelectItem value="veryActive">Very Active</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage className="text-xs mt-1" />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="dietPreference"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium">Diet Preference</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., balanced, vegan, keto"
                                  {...field}
                                  value={field.value ?? ""}
                                  onChange={(e) => field.onChange(e.target.value || undefined)}
                                  className="h-9 text-sm"
                                />
                              </FormControl>
                              <FormMessage className="text-xs mt-1" />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </AnimatedItem>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <AnimatedItem>
                      <Card className="h-full">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Heart className="h-4 w-4 text-primary" />
                            <span>Health Conditions</span>
                          </CardTitle>
                          <CardDescription className="text-xs">Select any health conditions you have</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <FormField
                            control={form.control}
                            name="healthConditions"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <HealthConditions
                                    conditions={healthConditionsList}
                                    selectedConditions={field.value || []}
                                    onChange={field.onChange}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs mt-1" />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </AnimatedItem>

                    <AnimatedItem>
                      <Card className="h-full">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Droplet className="h-4 w-4 text-primary" />
                            <span>Water Intake</span>
                          </CardTitle>
                          <CardDescription className="text-xs">Track your daily water consumption</CardDescription>
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
                                    onChange={(value) => field.onChange(value ?? undefined)}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs mt-1" />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </AnimatedItem>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button type="submit" className="gap-2 h-9 px-4" disabled={mutation.isPending}>
                      {mutation.isPending ? (
                        <>
                          <span className="animate-spin h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full" />
                          <span className="text-sm">Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-3.5 w-3.5" />
                          <span className="text-sm">Save Changes</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
          </AnimatedTab>

          <AnimatedTab tabKey="security-tab">
            <TabsContent value="security">
              <AnimatedItem>
                {/* Render ResetPassword outside the parent form */}
                <ResetPassword />
              </AnimatedItem>
            </TabsContent>
          </AnimatedTab>
        </AnimatePresence>
      </Tabs>
    </div>
  );
};

export default ProfileForm;