"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useClientPasswordUpdateMutation } from "@/hooks/client/useClientPasswordChange";
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

const ResetPassword: React.FC = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { successToast, errorToast } = useToaster();
  const { mutate: updatePassword, isPending: isSubmitting } =
    useClientPasswordUpdateMutation();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (
    data: ResetPasswordFormValues,
    e?: React.BaseSyntheticEvent
  ) => {
    e?.preventDefault();
    console.log("Form submitted with data:", data);
    updatePassword(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: (response) => {
          console.log("Mutation success:", response);
          successToast(response.message || "Password updated successfully");
          form.reset();
        },
        onError: (error: any) => {
          console.log("Full error object:", error); // Debug full error structure
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to update password";
          errorToast(errorMessage);
        },
      }
    );
  };

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
    if (strength < 30) return "Weak";
    if (strength < 60) return "Fair";
    if (strength < 80) return "Good";
    return "Strong";
  };

  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "newPassword") {
        setPasswordStrength(calculatePasswordStrength(value.newPassword || ""));
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  return (
    <Card className="w-full border-violet-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-violet-600" />
          <span>Change Password</span>
        </CardTitle>
        <CardDescription>
          Update your password to keep your account secure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6 bg-violet-50 border-violet-200 text-violet-800">
          <ShieldCheck className="h-4 w-4 text-violet-600" />
          <AlertDescription className="text-sm">
            Your password should be at least 8 characters and include a mix of
            letters, numbers, and symbols for better security.
          </AlertDescription>
        </Alert>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
            method="POST"
          >
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-violet-800">
                    Current Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Enter your current password"
                        {...field}
                        className="pl-10 border-violet-200 focus-visible:ring-violet-500"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-violet-600"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-violet-800">
                    New Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter your new password"
                        {...field}
                        className="pl-10 border-violet-200 focus-visible:ring-violet-500"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-violet-600"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  {field.value && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>Password Strength:</span>
                        <span
                          className={
                            passwordStrength > 60
                              ? "text-green-500"
                              : passwordStrength > 30
                              ? "text-yellow-500"
                              : "text-red-500"
                          }
                        >
                          {getStrengthText(passwordStrength)}
                        </span>
                      </div>
                      <Progress
                        value={passwordStrength}
                        className={`h-1.5 ${getStrengthColor(
                          passwordStrength
                        )}`}
                      />
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="flex items-center text-xs gap-1">
                          <CheckCircle2
                            className={`h-3 w-3 ${
                              /[A-Z]/.test(field.value)
                                ? "text-green-500"
                                : "text-muted-foreground"
                            }`}
                          />
                          <span>Uppercase</span>
                        </div>
                        <div className="flex items-center text-xs gap-1">
                          <CheckCircle2
                            className={`h-3 w-3 ${
                              /[a-z]/.test(field.value)
                                ? "text-green-500"
                                : "text-muted-foreground"
                            }`}
                          />
                          <span>Lowercase</span>
                        </div>
                        <div className="flex items-center text-xs gap-1">
                          <CheckCircle2
                            className={`h-3 w-3 ${
                              /[0-9]/.test(field.value)
                                ? "text-green-500"
                                : "text-muted-foreground"
                            }`}
                          />
                          <span>Numbers</span>
                        </div>
                        <div className="flex items-center text-xs gap-1">
                          <CheckCircle2
                            className={`h-3 w-3 ${
                              /[^A-Za-z0-9]/.test(field.value)
                                ? "text-green-500"
                                : "text-muted-foreground"
                            }`}
                          />
                          <span>Special Chars</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-violet-800">
                    Confirm New Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your new password"
                        {...field}
                        className="pl-10 border-violet-200 focus-visible:ring-violet-500"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-violet-600"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                className="bg-violet-600 hover:bg-violet-700 gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Update Password
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ResetPassword;
