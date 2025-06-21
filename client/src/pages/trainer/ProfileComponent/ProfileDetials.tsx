"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Ruler,
  Weight,
  Briefcase,
  GraduationCap,
  Target,
  BadgeCheck,
  Plus,
  X,
  Edit3,
  Save,
  ArrowLeft,
  Dumbbell,
  Heart,
  Sparkles,
  FileText,
  Zap,
  Flame,
  Clock,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUpdateTrainerProfile } from "@/services/trainer/useTrainerUpdateProfile";
import { ITrainer } from "@/types/User";
import { useToaster } from "@/hooks/ui/useToaster";
import * as Yup from "yup";
import { useAllCategoryQuery } from "@/hooks/category/useAllCategory";
import { getAllCategoriesForTrainer } from "@/services/trainer/trainerService";
import ProfileImageUploader from "@/components/common/ImageCropper/ProfileImageUploader";
import { Checkbox } from "@mui/material";
import { CategoryType } from "@/hooks/admin/useAllCategory";

interface TrainerProps {
  trainer: (ITrainer & { clientId?: string }) | null;
}

const trainerProfileSchema = Yup.object({
  firstName: Yup.string()
    .min(2, "First name must be at least 2 characters")
    .required("First name is required"),
  lastName: Yup.string()
    .min(2, "Last name must be at least 2 characters")
    .required("Last name is required"),
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  phoneNumber: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Phone number is required"),
  experience: Yup.number()
    .min(0, "Experience cannot be negative")
    .required("Experience is required"),
  height: Yup.number()
    .min(50, "Height must be at least 50 cm")
    .required("Height is required"),
  weight: Yup.number()
    .min(20, "Weight must be at least 20 kg")
    .required("Weight is required"),
  specialization: Yup.array()
    .min(1, "Please select at least one specialization")
    .required("Specialization is required"),
});

export default function ProfileDetails({ trainer }: TrainerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newQualification, setNewQualification] = useState("");
  const { successToast, errorToast } = useToaster();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useAllCategoryQuery(getAllCategoriesForTrainer);
  console.log(categoriesData);
  const { mutate: updateProfile, isPending } = useUpdateTrainerProfile();

  const [formData, setFormData] = useState<ITrainer & { clientId?: string }>(
    trainer || {
      id: "",
      clientId: "",
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      role: "trainer",
      profileImage: "",
      height: 0,
      weight: 0,
      dateOfBirth: "",
      gender: "",
      experience: 0,
      skills: [],
      qualifications: [],
      specialization: [],
      certifications: [],
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  );

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case "strength training":
        return <Dumbbell className="h-4 w-4 text-cyan-600" />;
      case "cardio":
        return <Heart className="h-4 w-4 text-red-600" />;
      case "yoga":
        return <Sparkles className="h-4 w-4 text-purple-600" />;
      case "nutrition":
        return <Flame className="h-4 w-4 text-orange-600" />;
      case "crossfit":
        return <Zap className="h-4 w-4 text-yellow-600" />;
      case "pilates":
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Target className="h-4 w-4 text-cyan-600" />;
    }
  };

  const validateField = async (name: string, value: any) => {
    try {
      await trainerProfileSchema.validateAt(name, { [name]: value });
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        setErrors((prev) => ({
          ...prev,
          [name]: error.message,
        }));
      }
    }
  };

  const validateForm = async () => {
    try {
      await trainerProfileSchema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const newErrors: Record<string, string> = {};
        error.inner.forEach((err) => {
          if (err.path) newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
        return false;
      }
      return false;
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const newValue =
      name === "height" || name === "weight" || name === "experience"
        ? Number(value)
        : value;
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    validateField(name, newValue);
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter((s) => s !== skill),
    }));
  };

  const addQualification = () => {
    if (newQualification.trim()) {
      setFormData((prev) => ({
        ...prev,
        qualifications: [
          ...(prev.qualifications || []),
          newQualification.trim(),
        ],
      }));
      setNewQualification("");
    }
  };

  const removeQualification = (qualification: string) => {
    setFormData((prev) => ({
      ...prev,
      qualifications: (prev.qualifications || []).filter(
        (q) => q !== qualification
      ),
    }));
  };

  const handleSpecializationChange = (
    categoryTitle: string,
    checked: boolean
  ) => {
    let newSpecializations = [...(formData.specialization || [])];
    if (checked) {
      newSpecializations.push(categoryTitle);
    } else {
      newSpecializations = newSpecializations.filter(
        (spec) => spec !== categoryTitle
      );
    }
    setFormData((prev) => ({
      ...prev,
      specialization: newSpecializations,
    }));
    validateField("specialization", newSpecializations);
  };

  const handleCertFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const filePromises = filesArray.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          })
      );
      Promise.all(filePromises).then((base64Files) => {
        setFormData((prev) => ({
          ...prev,
          certifications: [...(prev.certifications || []), ...base64Files],
        }));
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainer?.id || !trainer?.clientId) {
      errorToast("Trainer ID or clientId missing");
      return;
    }

    const isValid = await validateForm();
    if (!isValid) {
      errorToast("Please fix the form errors before submitting");
      return;
    }

    const profileData: Partial<ITrainer> & { clientId?: string } = {
      ...formData,
      id: undefined,
      role: undefined,
      status: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      clientId: trainer.clientId,
    };

    updateProfile(
      { trainerId: trainer.id, profileData },
      {
        onSuccess: (data) => {
          setIsEditing(false);
          setFormData(data.trainer);
          successToast("Profile updated successfully");
        },
        onError: (error) => {
          errorToast(error.message || "Failed to update profile");
        },
      }
    );
  };

  const getInitials = () => {
    if (!trainer) return "TR";
    return `${trainer.firstName?.[0] || ""}${
      trainer.lastName?.[0] || ""
    }`.toUpperCase();
  };

  const handleImageCropComplete = (croppedImageUrl: string | null) => {
    setFormData((prev) => ({
      ...prev,
      profileImage: croppedImageUrl || "",
    }));
  };

  useEffect(() => {
    if (isEditing) {
      validateForm();
    }
  }, [isEditing]);

  if (!trainer && !isEditing) {
    return (
      <div className="relative flex h-64 flex-col items-center justify-center gap-4 overflow-hidden rounded-lg border border-dashed border-muted-foreground/50 bg-muted/20 p-8">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="smoky-bg"></div>
        </div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <User className="h-16 w-16 text-violet-400" />
        </motion.div>
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="text-center text-lg text-white"
        >
          No trainer profile available. Please add your information.
        </motion.p>
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-violet-600 text-white hover:bg-violet-700"
            size="lg"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Profile
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.form
            key="edit-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            <div className="relative flex items-center justify-between overflow-hidden rounded-lg bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 p-4">
              <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="smoky-bg"></div>
              </div>
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-bold text-white"
              >
                Edit Profile
              </motion.h2>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditing(false)}
                className="gap-2 text-white hover:bg-white/20"
                disabled={isPending}
              >
                <ArrowLeft className="h-4 w-4" /> Back to Profile
              </Button>
            </div>

            <div className="flex flex-col items-center space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm md:flex-row md:items-start md:space-x-8 md:space-y-0">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-full">
                  <ProfileImageUploader
                    initialImage={formData.profileImage}
                    onCropComplete={handleImageCropComplete}
                  />
                </div>
              </div>

              <div className="w-full space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="firstName"
                      className="flex items-center gap-2 text-sm font-medium text-blue-600"
                    >
                      <User className="h-4 w-4" /> First Name
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 z-10">
                        <User className="h-4 w-4" />
                      </span>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName || ""}
                        onChange={handleChange}
                        required
                        className={`pl-10 focus-visible:ring-blue-500 ${
                          errors.firstName ? "border-red-500" : ""
                        }`}
                        disabled={isPending}
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="lastName"
                      className="flex items-center gap-2 text-sm font-medium text-blue-600"
                    >
                      <User className="h-4 w-4" /> Last Name
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 z-10">
                        <User className="h-4 w-4" />
                      </span>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName || ""}
                        onChange={handleChange}
                        required
                        className={`pl-10 focus-visible:ring-blue-500 ${
                          errors.lastName ? "border-red-500" : ""
                        }`}
                        disabled={isPending}
                      />
                    </div>
                    {errors.lastName && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="flex items-center gap-2 text-sm font-medium text-green-600"
                    >
                      <Mail className="h-4 w-4" /> Email
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 z-10">
                        <Mail className="h-4 w-4" />
                      </span>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email || ""}
                        onChange={handleChange}
                        readOnly
                        className={`bg-muted pl-10 ${
                          errors.email ? "border-red-500" : ""
                        }`}
                        disabled={isPending}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="phoneNumber"
                      className="flex items-center gap-2 text-sm font-medium text-green-600"
                    >
                      <Phone className="h-4 w-4" /> Phone Number
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 z-10">
                        <Phone className="h-4 w-4" />
                      </span>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber || ""}
                        onChange={handleChange}
                        className={`pl-10 focus-visible:ring-green-500 ${
                          errors.phoneNumber ? "border-red-500" : ""
                        }`}
                        disabled={isPending}
                      />
                    </div>
                    {errors.phoneNumber && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-violet-700">
                <User className="h-5 w-5" /> Personal Information
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label
                    htmlFor="experience"
                    className="flex items-center gap-2 text-sm font-medium text-red-600"
                  >
                    <Briefcase className="h-4 w-4" /> Experience (years)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500 z-10">
                      <Briefcase className="h-4 w-4" />
                    </span>
                    <Input
                      id="experience"
                      name="experience"
                      type="number"
                      value={formData.experience || ""}
                      onChange={handleChange}
                      className={`pl-10 focus-visible:ring-red-500 ${
                        errors.experience ? "border-red-500" : ""
                      }`}
                      disabled={isPending}
                    />
                  </div>
                  {errors.experience && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.experience}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="height"
                    className="flex items-center gap-2 text-sm font-medium text-orange-600"
                  >
                    <Ruler className="h-4 w-4" /> Height (cm)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 z-10">
                      <Ruler className="h-4 w-4" />
                    </span>
                    <Input
                      id="height"
                      name="height"
                      type="number"
                      value={formData.height || ""}
                      onChange={handleChange}
                      className={`pl-10 focus-visible:ring-orange-500 ${
                        errors.height ? "border-red-500" : ""
                      }`}
                      disabled={isPending}
                    />
                  </div>
                  {errors.height && (
                    <p className="text-xs text-red-500 mt-1">{errors.height}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="weight"
                    className="flex items-center gap-2 text-sm font-medium text-amber-600"
                  >
                    <Weight className="h-4 w-4" /> Weight (kg)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 z-10">
                      <Weight className="h-4 w-4" />
                    </span>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      value={formData.weight || ""}
                      onChange={handleChange}
                      className={`pl-10 focus-visible:ring-amber-500 ${
                        errors.weight ? "border-red-500" : ""
                      }`}
                      disabled={isPending}
                    />
                  </div>
                  {errors.weight && (
                    <p className="text-xs text-red-500 mt-1">{errors.weight}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-purple-700">
                  <Dumbbell className="h-5 w-5" /> Skills
                </h3>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 z-10">
                      <Zap className="h-4 w-4" />
                    </span>
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill"
                      className="pl-10 focus-visible:ring-purple-500"
                      disabled={isPending}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={addSkill}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={isPending}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {formData.skills?.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="gap-1 bg-purple-100 px-3 py-1.5 text-purple-800"
                    >
                      {skill}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="ml-1 h-4 w-4 rounded-full p-0 text-purple-700 hover:bg-purple-200 hover:text-purple-900"
                        onClick={() => removeSkill(skill)}
                        disabled={isPending}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-pink-700">
                  <GraduationCap className="h-5 w-5" /> Qualifications
                </h3>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-500 z-10">
                      <FileText className="h-4 w-4" />
                    </span>
                    <Input
                      value={newQualification}
                      onChange={(e) => setNewQualification(e.target.value)}
                      placeholder="Add a qualification"
                      className="pl-10 focus-visible:ring-pink-500"
                      disabled={isPending}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={addQualification}
                    size="sm"
                    className="bg-pink-600 hover:bg-pink-700"
                    disabled={isPending}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <ul className="mt-4 space-y-2">
                  {formData.qualifications?.map((qualification, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between rounded-md bg-pink-50 p-2 text-pink-800"
                    >
                      <span className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-pink-600" />
                        {qualification}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full p-0 text-pink-700 hover:bg-pink-200 hover:text-pink-900"
                        onClick={() => removeQualification(qualification)}
                        disabled={isPending}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-cyan-700">
                  <Target className="h-5 w-5" /> Specialization
                </h3>
                <div className="space-y-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500 z-10">
                      <Target className="h-4 w-4" />
                    </span>
                    <div className="grid grid-cols-1 gap-3">
                      {isCategoriesLoading ? (
                        <p className="text-sm text-muted-foreground">
                          Loading categories...
                        </p>
                      ) : categoriesData?.categories?.length ? (
                        categoriesData.categories.map(
                          (category: CategoryType) => (
                            <div
                              key={category.categoryId}
                              className="flex items-center gap-3"
                            >
                              <Checkbox
                                id={category.categoryId}
                                checked={
                                  formData.specialization?.includes(
                                    category.title
                                  ) || false
                                }
                                onChange={(e) =>
                                  handleSpecializationChange(
                                    category.title,
                                    e.target.checked
                                  )
                                }
                                disabled={isPending}
                                className="h-5 w-5 border-cyan-300 text-cyan-600 focus:ring-cyan-500"
                              />
                              <Label
                                htmlFor={category.categoryId}
                                className="flex items-center gap-2 text-sm font-medium text-cyan-800"
                              >
                                {getCategoryIcon(category.title)}
                                {category.title}
                              </Label>
                            </div>
                          )
                        )
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No categories available
                        </p>
                      )}
                    </div>
                  </div>
                  {errors.specialization && (
                    <p className="text-xs text-red-500">
                      {errors.specialization}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-amber-700">
                  <BadgeCheck className="h-5 w-5" /> Certifications
                </h3>
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-amber-200 bg-amber-50 p-4">
                    <Label
                      htmlFor="certifications"
                      className="flex cursor-pointer flex-col items-center gap-2"
                    >
                      <Upload className="h-8 w-8 text-amber-600" />
                      <span className="text-sm text-amber-700">
                        Upload PDF certificates
                      </span>
                      <Input
                        id="certifications"
                        type="file"
                        accept=".pdf"
                        onChange={handleCertFileChange}
                        className="hidden"
                        multiple
                        disabled={isPending}
                      />
                    </Label>
                  </div>
                  <ul className="space-y-2">
                    {formData.certifications?.map((cert, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between gap-3 rounded-md bg-amber-50 p-2 text-sm text-amber-800"
                      >
                        <div className="flex items-center gap-2">
                          <BadgeCheck className="h-4 w-4 text-amber-600" />
                          <span>
                            {cert.startsWith("data:") || cert.startsWith("http")
                              ? `Certificate ${index + 1}`
                              : cert}
                          </span>
                        </div>
                        {(cert.startsWith("data:") ||
                          cert.startsWith("http")) && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-amber-300 text-amber-700 hover:bg-amber-100"
                            onClick={() => window.open(cert, "_blank")}
                            disabled={isPending}
                          >
                            View
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="gap-2 bg-violet-600 hover:bg-violet-700"
                disabled={isPending || Object.keys(errors).length > 0}
              >
                {isPending ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save Changes
                  </>
                )}
              </Button>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="view-profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-bold text-violet-700"
              >
                Trainer Profile
              </motion.h2>
              <Button
                onClick={() => setIsEditing(true)}
                className="gap-2 bg-violet-600 hover:bg-violet-700"
              >
                <Edit3 className="h-4 w-4" /> Edit Profile
              </Button>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="smoky-bg"></div>
              </div>
              <div className="relative h-32 w-full">
                <motion.div
                  initial={{ y: -100 }}
                  animate={{ y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                    delay: 0.2,
                  }}
                  className="absolute -bottom-16 left-6 flex items-end md:left-8"
                >
                  <Avatar className="h-32 w-32 border-4 border-background shadow-md">
                    <AvatarImage src={trainer?.profileImage} />
                    <AvatarFallback
                      className="bg-[#f3e8ff] text-3xl"
                      style={{ color: "#4B0082" }}
                    >
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
              </div>
              <div className="mt-20 px-6 pb-6 md:px-8 md:pb-8">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      style={{ color: "#2F004F" }}
                      className="text-2xl font-bold"
                    >
                      {trainer?.firstName} {trainer?.lastName}
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      style={{ color: "#004D40" }}
                    >
                      Fitness Trainer
                      {trainer?.specialization &&
                        trainer.specialization.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {trainer.specialization.map((spec, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                style={{
                                  borderColor: "#3E2723",
                                  color: "#3E2723",
                                }}
                              >
                                {spec}
                              </Badge>
                            ))}
                          </div>
                        )}
                    </motion.p>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-wrap gap-3"
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm"
                            style={{ color: "#1B2631" }}
                          >
                            <Mail className="h-4 w-4" />
                            <span className="hidden md:inline">
                              {trainer?.email}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{trainer?.email}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {trainer?.phoneNumber && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm"
                              style={{ color: "#1B2631" }}
                            >
                              <Phone className="h-4 w-4" />
                              <span className="hidden md:inline">
                                {trainer.phoneNumber}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{trainer.phoneNumber}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {trainer?.experience !== undefined && (
                      <div
                        className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm"
                        style={{ color: "#1B2631" }}
                      >
                        <Briefcase className="h-4 w-4" />
                        <span>{trainer.experience} years</span>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="col-span-1"
              >
                <Card className="h-full border-border shadow-sm transition-all hover:shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg font-medium text-blue-600">
                      <User className="mr-2 h-5 w-5 text-blue-500" /> Personal
                      Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {trainer?.dateOfBirth && (
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100">
                            <Calendar className="h-5 w-5 text-teal-600" />
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">
                              Date of Birth
                            </span>
                            <p className="font-medium text-teal-700">
                              {trainer.dateOfBirth}
                            </p>
                          </div>
                        </div>
                      )}
                      {trainer?.gender && (
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100">
                            <User className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">
                              Gender
                            </span>
                            <p className="font-medium text-indigo-700">
                              {trainer.gender}
                            </p>
                          </div>
                        </div>
                      )}
                      {trainer?.height && (
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100">
                            <Ruler className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">
                              Height
                            </span>
                            <p className="font-medium text-orange-700">
                              {trainer.height} cm
                            </p>
                          </div>
                        </div>
                      )}
                      {trainer?.weight && (
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                            <Weight className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">
                              Weight
                            </span>
                            <p className="font-medium text-amber-700">
                              {trainer.weight} kg
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="col-span-1"
              >
                <Card className="h-full border-border shadow-sm transition-all hover:shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg font-medium text-purple-600">
                      <Dumbbell className="mr-2 h-5 w-5 text-purple-500" />{" "}
                      Professional Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {trainer?.skills?.map((skill, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 * index }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <Badge
                            variant="secondary"
                            className="bg-purple-100 px-2.5 py-1 text-purple-800"
                          >
                            {skill}
                          </Badge>
                        </motion.div>
                      ))}
                      {(!trainer?.skills || trainer.skills.length === 0) && (
                        <p className="text-sm text-muted-foreground">
                          No skills added yet
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="col-span-1"
              >
                <Card className="h-full border-border shadow-sm transition-all hover:shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg font-medium text-pink-600">
                      <GraduationCap className="mr-2 h-5 w-5 text-pink-500" />{" "}
                      Qualifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {trainer?.qualifications?.map((qualification, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="flex items-center gap-2 rounded-md bg-pink-50 p-2 text-sm text-pink-800"
                        >
                          <GraduationCap className="h-4 w-4 text-pink-600" />
                          {qualification}
                        </motion.li>
                      ))}
                      {(!trainer?.qualifications ||
                        trainer.qualifications.length === 0) && (
                        <p className="text-sm text-muted-foreground">
                          No qualifications added yet
                        </p>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="col-span-1 md:col-span-2 lg:col-span-3"
              >
                <Card className="border-border shadow-sm transition-all hover:shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg font-medium text-amber-600">
                      <BadgeCheck className="mr-2 h-5 w-5 text-amber-500" />{" "}
                      Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {trainer?.certifications?.map((cert, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                              <BadgeCheck className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                              <p className="font-medium text-amber-800">
                                {cert.startsWith("data:") ||
                                cert.startsWith("http")
                                  ? `Certificate ${index + 1}`
                                  : cert}
                              </p>
                              <p className="text-xs text-amber-600">Verified</p>
                            </div>
                          </div>
                          {(cert.startsWith("data:") ||
                            cert.startsWith("http")) && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-amber-300 text-amber-700 hover:bg-amber-100"
                              onClick={() => window.open(cert, "_blank")}
                            >
                              View
                            </Button>
                          )}
                        </motion.div>
                      ))}
                      {(!trainer?.certifications ||
                        trainer.certifications.length === 0) && (
                        <p className="text-sm text-muted-foreground">
                          No certifications added yet
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
