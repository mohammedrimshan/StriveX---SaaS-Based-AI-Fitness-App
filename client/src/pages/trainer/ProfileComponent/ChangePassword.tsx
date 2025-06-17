"use client";

import  { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Lock,
  Key,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Shield,
  AlertTriangle,
  PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import confetti from "canvas-confetti";
import { useTrainerPasswordUpdateMutation } from "@/hooks/trainer/useTrainerPasswordChange";
import { useToaster } from "@/hooks/ui/useToaster";

const resetPasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "Current password must be at least 6 characters"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const emojiMap = {
  weak: "😟",
  fair: "🙂",
  good: "😀",
  strong: "🚀",
};

export default function EnhancedPasswordForm() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [success, setSuccess] = useState(false);
  const { successToast, errorToast } = useToaster();
  const { mutate: updatePassword, isPending: isSubmitting } =
    useTrainerPasswordUpdateMutation();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const calculatePasswordStrength = (password: string) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;
    return Math.min(strength, 100);
  };

  const getStrengthColor = (strength: number) => {
    if (strength < 30) return "bg-red-500";
    if (strength < 60) return "bg-yellow-500";
    if (strength < 80) return "bg-amber-500";
    return "bg-green-500";
  };

  const getStrengthText = (strength: number) => {
    if (strength < 30) return "weak";
    if (strength < 60) return "fair";
    if (strength < 80) return "good";
    return "strong";
  };

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "newPassword") {
        setPasswordStrength(calculatePasswordStrength(value.newPassword || ""));
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
    });
  };

  const onSubmit = (data: ResetPasswordFormValues) => {
    updatePassword(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: (response) => {
          setSuccess(true);
          form.reset();
          successToast(
            response.data?.message || "Password updated successfully!"
          );
          triggerConfetti();

          // Reset success state after 5 seconds
          setTimeout(() => {
            setSuccess(false);
          }, 5000);
        },
        onError: (err: any) => {
          // Clear sensitive fields on error
          form.resetField("currentPassword");

          // Handle error response
          const errorMessage =
            err.response?.data?.message ||
            err.message ||
            "An error occurred while updating password";

          errorToast(errorMessage);

          // Set field-specific error if available
          if (errorMessage.toLowerCase().includes("current password")) {
            form.setError("currentPassword", {
              type: "manual",
              message: errorMessage,
            });
          }
        },
      }
    );
  };

  const strengthText = form.watch("newPassword")
    ? getStrengthText(passwordStrength)
    : "";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-8"
    >
      <div className="mx-auto max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <motion.div
            className="lg:col-span-4 flex flex-col justify-center"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.3,
              }}
              className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-indigo-100 shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 10, 0],
                }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 4,
                  ease: "easeInOut",
                }}
              >
                <Lock className="h-16 w-16 text-indigo-600" />
              </motion.div>
            </motion.div>

            <motion.h2
              className="text-3xl font-bold text-indigo-700 text-center mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Secure Your Account
            </motion.h2>

            <motion.p
              className="text-gray-600 text-center mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Protect your information by updating your password regularly.
              Strong passwords help keep your account secure.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Alert className="bg-indigo-50 border-indigo-200 text-indigo-800">
                <ShieldCheck className="h-5 w-5 text-indigo-600" />
                <AlertDescription className="text-sm">
                  A strong password should include uppercase and lowercase
                  letters, numbers, and special characters. Aim for at least 12
                  characters.
                </AlertDescription>
              </Alert>
            </motion.div>

            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200 text-green-800 flex items-center gap-3"
                >
                  <PartyPopper className="h-6 w-6 text-green-500" />
                  <div>
                    <h3 className="font-semibold">Password Updated!</h3>
                    <p className="text-sm">
                      Your password has been successfully changed.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            className="lg:col-span-8"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
          >
            <Card className="border-indigo-200 shadow-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Shield className="h-6 w-6" />
                  <span>Password Management</span>
                </CardTitle>
                <CardDescription className="text-indigo-100">
                  Update your credentials to maintain account security
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <FormField
                        control={form.control}
                        name="currentPassword"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel className="text-indigo-800 text-lg">
                              Current Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Key className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input
                                  type={
                                    showCurrentPassword ? "text" : "password"
                                  }
                                  placeholder="Enter your current password"
                                  {...field}
                                  className={`pl-10 py-6 text-base ${
                                    fieldState.error
                                      ? "border-red-500 focus-visible:ring-red-500"
                                      : "border-indigo-200 focus-visible:ring-indigo-500"
                                  }`}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-indigo-600"
                                  onClick={() =>
                                    setShowCurrentPassword(!showCurrentPassword)
                                  }
                                >
                                  {showCurrentPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                  ) : (
                                    <Eye className="h-5 w-5" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            {fieldState.error && (
                              <div className="flex items-center gap-1 text-sm text-red-500 mt-1">
                                <AlertTriangle className="h-4 w-4" />
                                <FormMessage />
                              </div>
                            )}
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-indigo-800 text-lg">
                              New Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input
                                  type={showNewPassword ? "text" : "password"}
                                  placeholder="Enter your new password"
                                  {...field}
                                  className="pl-10 py-6 text-base border-indigo-200 focus-visible:ring-indigo-500"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-indigo-600"
                                  onClick={() =>
                                    setShowNewPassword(!showNewPassword)
                                  }
                                >
                                  {showNewPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                  ) : (
                                    <Eye className="h-5 w-5" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>

                            <AnimatePresence>
                              {field.value && (
                                <motion.div
                                  className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-100"
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <div className="flex items-center justify-between text-sm mb-1">
                                    <span className="font-medium">
                                      Password Strength:
                                    </span>
                                    <motion.span
                                      className={
                                        passwordStrength > 60
                                          ? "text-green-500 font-semibold"
                                          : passwordStrength > 30
                                          ? "text-yellow-500 font-semibold"
                                          : "text-red-500 font-semibold"
                                      }
                                      initial={{ scale: 0.8 }}
                                      animate={{ scale: 1 }}
                                      transition={{
                                        type: "spring",
                                        stiffness: 500,
                                      }}
                                    >
                                      <span className="flex items-center gap-1">
                                        {getStrengthText(passwordStrength)}
                                        <span className="text-xl">
                                          {
                                            emojiMap[
                                              strengthText as keyof typeof emojiMap
                                            ]
                                          }
                                        </span>
                                      </span>
                                    </motion.span>
                                  </div>

                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ delay: 0.1, duration: 0.4 }}
                                  >
                                    <Progress
                                      value={passwordStrength}
                                      className={`h-2 ${getStrengthColor(
                                        passwordStrength
                                      )}`}
                                    />
                                  </motion.div>

                                  <div className="grid grid-cols-4 gap-2 mt-3">
                                    <motion.div
                                      className={`flex items-center text-sm gap-1 p-2 rounded-md ${
                                        /[A-Z]/.test(field.value)
                                          ? "bg-green-50 text-green-700"
                                          : "bg-gray-100 text-gray-500"
                                      }`}
                                      initial={{ opacity: 0, y: 5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: 0.2 }}
                                    >
                                      <CheckCircle2
                                        className={`h-4 w-4 ${
                                          /[A-Z]/.test(field.value)
                                            ? "text-green-500"
                                            : "text-gray-400"
                                        }`}
                                      />
                                      <span>Uppercase</span>
                                    </motion.div>
                                    <motion.div
                                      className={`flex items-center text-sm gap-1 p-2 rounded-md ${
                                        /[a-z]/.test(field.value)
                                          ? "bg-green-50 text-green-700"
                                          : "bg-gray-100 text-gray-500"
                                      }`}
                                      initial={{ opacity: 0, y: 5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: 0.3 }}
                                    >
                                      <CheckCircle2
                                        className={`h-4 w-4 ${
                                          /[a-z]/.test(field.value)
                                            ? "text-green-500"
                                            : "text-gray-400"
                                        }`}
                                      />
                                      <span>Lowercase</span>
                                    </motion.div>
                                    <motion.div
                                      className={`flex items-center text-sm gap-1 p-2 rounded-md ${
                                        /[0-9]/.test(field.value)
                                          ? "bg-green-50 text-green-700"
                                          : "bg-gray-100 text-gray-500"
                                      }`}
                                      initial={{ opacity: 0, y: 5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: 0.4 }}
                                    >
                                      <CheckCircle2
                                        className={`h-4 w-4 ${
                                          /[0-9]/.test(field.value)
                                            ? "text-green-500"
                                            : "text-gray-400"
                                        }`}
                                      />
                                      <span>Numbers</span>
                                    </motion.div>
                                    <motion.div
                                      className={`flex items-center text-sm gap-1 p-2 rounded-md ${
                                        /[^A-Za-z0-9]/.test(field.value)
                                          ? "bg-green-50 text-green-700"
                                          : "bg-gray-100 text-gray-500"
                                      }`}
                                      initial={{ opacity: 0, y: 5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: 0.5 }}
                                    >
                                      <CheckCircle2
                                        className={`h-4 w-4 ${
                                          /[^A-Za-z0-9]/.test(field.value)
                                            ? "text-green-500"
                                            : "text-gray-400"
                                        }`}
                                      />
                                      <span>Special</span>
                                    </motion.div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel className="text-indigo-800 text-lg">
                              Confirm New Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input
                                  type={
                                    showConfirmPassword ? "text" : "password"
                                  }
                                  placeholder="Confirm your new password"
                                  {...field}
                                  className={`pl-10 py-6 text-base ${
                                    fieldState.error
                                      ? "border-red-500 focus-visible:ring-red-500"
                                      : "border-indigo-200 focus-visible:ring-indigo-500"
                                  }`}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-indigo-600"
                                  onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                  }
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                  ) : (
                                    <Eye className="h-5 w-5" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            {fieldState.error && (
                              <div className="flex items-center gap-1 text-sm text-red-500 mt-1">
                                <AlertTriangle className="h-4 w-4" />
                                <FormMessage />
                              </div>
                            )}
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div
                      className="pt-4 flex justify-end"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.div
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                            >
                              <Button
                                type="submit"
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg py-6 px-8 gap-2"
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? (
                                  <>
                                    <span className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                                    Updating Password...
                                  </>
                                ) : (
                                  <>
                                    <motion.div
                                      animate={{
                                        rotate: [0, 20, -20, 0],
                                      }}
                                      transition={{
                                        repeat: Infinity,
                                        repeatType: "loop",
                                        duration: 2,
                                        repeatDelay: 1,
                                      }}
                                    >
                                      <Sparkles className="h-5 w-5" />
                                    </motion.div>
                                    Update Password
                                  </>
                                )}
                              </Button>
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-indigo-800 text-white">
                            <p>
                              Secure your account with a strong new password
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </motion.div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
