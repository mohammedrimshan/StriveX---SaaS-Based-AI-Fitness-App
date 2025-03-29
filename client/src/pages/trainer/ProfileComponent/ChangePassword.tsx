"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Lock, Key, Eye, EyeOff, ShieldCheck, CheckCircle2, Sparkles, Shield, AlertTriangle, PartyPopper } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import toast from "react-hot-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import confetti from 'canvas-confetti'

const resetPasswordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password must be at least 6 characters"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
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
  strong: "🔒"
};

export default function ChangePassword() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

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
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  const onSubmit = (data: ResetPasswordFormValues) => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setSuccess(true);
      setIsSubmitting(false);
      form.reset();
      toast({
        title: "Password updated successfully! 🎉",
        description: "Your password has been changed securely.",
        variant: "default",
      });
      triggerConfetti();
    }, 1500);
  };

  const strengthText = form.watch("newPassword") ? getStrengthText(passwordStrength) : "";
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-6"
    >
      <div className="mx-auto max-w-md">
        <motion.div 
          className="mb-8 text-center"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20,
              delay: 0.2
            }}
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-violet-100"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 10, 0],
              }}
              transition={{ 
                repeat: Infinity, 
                repeatType: "reverse", 
                duration: 5,
                ease: "easeInOut"
              }}
            >
              <Lock className="h-10 w-10 text-violet-600" />
            </motion.div>
          </motion.div>
          <motion.h2 
            className="text-2xl font-bold text-violet-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Change Your Password
          </motion.h2>
          <motion.p 
            className="mt-2 text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Ensure your account remains secure by updating your password regularly
          </motion.p>
        </motion.div>
        
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <Alert className="border-green-200 bg-green-50">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 10, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: 0.5,
                    times: [0, 0.2, 0.5, 0.8, 1]
                  }}
                >
                  <PartyPopper className="h-5 w-5 text-green-600" />
                </motion.div>
                <AlertDescription className="text-green-800 flex items-center gap-2">
                  Your password has been successfully updated!
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
        
        <Card className="border-violet-200 overflow-hidden">
          <CardHeader className="bg-violet-50">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-violet-600" />
              <span>Password Security</span>
            </CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Alert className="mb-6 bg-violet-50 border-violet-200 text-violet-800">
                <ShieldCheck className="h-4 w-4 text-violet-600" />
                <AlertDescription className="text-sm">
                  Your password should be at least 8 characters and include a mix of letters, numbers, and symbols for better security.
                </AlertDescription>
              </Alert>
            </motion.div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-violet-800">Current Password</FormLabel>
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
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-violet-800">New Password</FormLabel>
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
                              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        
                        <AnimatePresence>
                          {field.value && (
                            <motion.div 
                              className="mt-2 space-y-1"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="flex items-center justify-between text-xs">
                                <span>Password Strength:</span>
                                <motion.span
                                  className={
                                    passwordStrength > 60
                                      ? "text-green-500"
                                      : passwordStrength > 30
                                      ? "text-yellow-500"
                                      : "text-red-500"
                                  }
                                  initial={{ scale: 0.8 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 500 }}
                                >
                                  <span className="flex items-center gap-1">
                                    {getStrengthText(passwordStrength)}
                                    <span className="text-base">{emojiMap[strengthText as keyof typeof emojiMap]}</span>
                                  </span>
                                </motion.span>
                              </div>
                              
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ delay: 0.1, duration: 0.3 }}
                              >
                                <Progress
                                  value={passwordStrength}
                                  className="h-1.5"
                                  indicatorClassName={getStrengthColor(passwordStrength)}
                                />
                              </motion.div>
                              
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <motion.div 
                                  className="flex items-center text-xs gap-1"
                                  initial={{ opacity: 0, x: -5 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.2 }}
                                >
                                  <CheckCircle2
                                    className={`h-3 w-3 ${/[A-Z]/.test(field.value) ? "text-green-500" : "text-muted-foreground"}`}
                                  />
                                  <span>Uppercase</span>
                                </motion.div>
                                <motion.div 
                                  className="flex items-center text-xs gap-1"
                                  initial={{ opacity: 0, x: -5 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.3 }}
                                >
                                  <CheckCircle2
                                    className={`h-3 w-3 ${/[a-z]/.test(field.value) ? "text-green-500" : "text-muted-foreground"}`}
                                  />
                                  <span>Lowercase</span>
                                </motion.div>
                                <motion.div 
                                  className="flex items-center text-xs gap-1"
                                  initial={{ opacity: 0, x: -5 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.4 }}
                                >
                                  <CheckCircle2
                                    className={`h-3 w-3 ${/[0-9]/.test(field.value) ? "text-green-500" : "text-muted-foreground"}`}
                                  />
                                  <span>Numbers</span>
                                </motion.div>
                                <motion.div 
                                  className="flex items-center text-xs gap-1"
                                  initial={{ opacity: 0, x: -5 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.5 }}
                                >
                                  <CheckCircle2
                                    className={`h-3 w-3 ${/[^A-Za-z0-9]/.test(field.value) ? "text-green-500" : "text-muted-foreground"}`}
                                  />
                                  <span>Special Chars</span>
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
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-violet-800">Confirm New Password</FormLabel>
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
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
                
                <motion.div 
                  className="pt-2 flex justify-end"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          type="submit" 
                          className="bg-violet-600 hover:bg-violet-700 gap-2" 
                          disabled={isSubmitting}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <motion.div
                                animate={{ 
                                  rotate: [0, 15, -15, 0],
                                }}
                                transition={{ 
                                  repeat: Infinity, 
                                  repeatType: "loop", 
                                  duration: 2,
                                  repeatDelay: 1
                                }}
                              >
                                <Sparkles className="h-4 w-4" />
                              </motion.div>
                              Update Password
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Secure your account with a new password</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </motion.div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
