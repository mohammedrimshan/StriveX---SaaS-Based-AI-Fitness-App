"use client";

import { useState, useRef, useEffect } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import './ForgotPassword.css';
import { ArrowLeft, Mail, Sparkles, SendHorizontal } from "lucide-react";
import { useForgotPasswordMutation } from "@/hooks/auth/useForgotPassword";
import { useToaster } from "@/hooks/ui/useToaster";
import { emailSchema } from "@/utils/validations/email.validator";
import { Header } from "../headers/Header/PublicHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Lottie from "lottie-react";
import emailSentAnimation from "@/assets/emailSent.json";
import { ForgotPasswordProps } from "@/types/Response";

const ForgotPassword = ({ role, signInPath }: ForgotPasswordProps) => {
  
  const [showModal, setShowModal] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [showFloatingElements, setShowFloatingElements] = useState(true);
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);

  const {
    mutate: forgotPassReq,
    isPending,
  } = useForgotPasswordMutation();
  const { successToast, errorToast } = useToaster();

  const handleForgotPasswordSubmit = ({ email }: { email: string }) => {
    forgotPassReq(
      { email, role },
      {
        onSuccess: (data) => {
          successToast(data.message);
          setShowModal(true);
          startAnimationSequence();
        },
        onError: (error: any) => {
          errorToast(error.response.data.message);
        },
      }
    );
  };

  const startAnimationSequence = () => {
    const steps = [1, 2, 3, 4];
    let delay = 0;

    steps.forEach((step, index) => {
      delay += index === 0 ? 300 : 800;
      setTimeout(() => {
        setAnimationStep(step);
      }, delay);
    });
  };

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: emailSchema,
    onSubmit: (values) => {
      handleForgotPasswordSubmit({ ...values });
    },
  });

  const closeModal = () => {
    setShowModal(false);
    setAnimationStep(0);
  };

  const tryAgain = () => {
    setShowModal(false);
    setAnimationStep(0);
  };

  // Randomly positioned floating elements
  const floatingElements = [
    { emoji: "✉️", size: "text-2xl", delay: 0 },
    { emoji: "🔐", size: "text-3xl", delay: 1.5 },
    { emoji: "💫", size: "text-xl", delay: 3 },
    { emoji: "🔑", size: "text-2xl", delay: 4.5 },
    { emoji: "📧", size: "text-xl", delay: 6 },
    { emoji: "⚡", size: "text-3xl", delay: 7.5 },
    { emoji: "🌟", size: "text-2xl", delay: 9 },
  ];

  useEffect(() => {
    // Toggle floating elements visibility every 10 seconds for a subtle reset
    const interval = setInterval(() => {
      setShowFloatingElements(false);
      setTimeout(() => setShowFloatingElements(true), 100);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <Header />

      {/* Main container - full height/width split layout */}
      <div className="flex flex-grow w-full h-full">
        {/* Left side - Image takes full left side of screen */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="hidden md:block w-1/2 h-full relative overflow-hidden"
        >
          {/* Image covers the entire left side */}
          <img
            src="https://res.cloudinary.com/daee3szbl/image/upload/v1750764156/forgot_1_ce7stf.jpg"
            alt="Password recovery"
            className="object-cover w-full h-full"
          />


          {/* Text on image - changed to white */}
          <motion.div
            className="absolute bottom-20 left-10 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            <motion.h2
              className="text-4xl font-medium mb-3"
              animate={{
                textShadow: [
                  "0 0 5px rgba(255, 255, 255, 0)",
                  "0 0 15px rgba(255, 255, 255, 0.5)",
                  "0 0 5px rgba(255, 255, 255, 0)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Secure Recovery
            </motion.h2>
            <p className="text-white font-normal text-lg max-w-md">
              We'll help you get back into your account in no time.
            </p>
          </motion.div>

          {/* Animated elements on the image side */}
          {showFloatingElements && (
            <>
              {floatingElements.map((element, index) => (
                <motion.div
                  key={index}
                  className={`absolute ${element.size} text-white opacity-30 pointer-events-none`}
                  initial={{
                    x: Math.random() * 100 - 50 + "%",
                    y: Math.random() * 100 - 50 + "%",
                    opacity: 0,
                    rotate: Math.random() * 180 - 90,
                  }}
                  animate={{
                    x: [
                      null,
                      Math.random() * 100 - 50 + "%",
                      Math.random() * 100 - 50 + "%",
                      Math.random() * 100 - 50 + "%",
                    ],
                    y: [
                      null,
                      Math.random() * 100 - 50 + "%",
                      Math.random() * 100 - 50 + "%",
                      Math.random() * 100 - 50 + "%",
                    ],
                    opacity: [0, 0.3, 0.3, 0],
                    rotate: [
                      null,
                      Math.random() * 360,
                      Math.random() * -360,
                      Math.random() * 360,
                    ],
                  }}
                  transition={{
                    duration: 20,
                    delay: element.delay,
                    repeat: Infinity,
                    repeatType: "loop",
                  }}
                >
                  {element.emoji}
                </motion.div>
              ))}
            </>
          )}
        </motion.div>

        {/* Right side - Form */}
        <motion.div
          className="w-full md:w-1/2 flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-white p-6 relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {/* Background elements for form side */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-violet-400 rounded-full filter blur-3xl opacity-20"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          ></motion.div>

          <motion.div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-400 rounded-full filter blur-3xl opacity-20"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 2,
            }}
          ></motion.div>

          {/* Form container */}
          <div className="w-full max-w-md z-10">
            {/* Back Button */}
            <motion.button
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              onClick={() => navigate(signInPath)}
              className="flex items-center text-violet-800 hover:text-violet-900 transition-colors mb-8 font-medium"
              whileHover={{ x: -5 }}
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              <span>Back to Sign In</span>
            </motion.button>

            {/* Form Header - adjusted styling */}
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-6"
            >
              <h1 className="text-3xl font-medium flex items-center gap-2 text-gray-800">
                Reset Password
                <motion.div
                  animate={{
                    rotate: [0, 15, -15, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                >
                  <Sparkles className="h-5 w-5 text-violet-500" />
                </motion.div>
              </h1>
              <p className="text-gray-600 font-normal mt-2">
                Enter your email and we'll send you instructions to reset your
                password
              </p>
            </motion.div>

            {/* Form */}
            <form
              ref={formRef}
              onSubmit={formik.handleSubmit}
              className="space-y-6"
            >
              <motion.div
                className="space-y-2"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="your@email.com"
                    className={`bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200 focus:border-violet-500 focus:ring-violet-500 ${
                      formik.touched.email && formik.errors.email
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  <Mail className="absolute right-3 top-2.5 h-4 w-4 text-violet-400" />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-sm text-red-500 font-medium"
                  >
                    {formik.errors.email}
                  </motion.p>
                )}
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="pt-4"
              >
                <Button
                  onClick={() => formRef.current!.requestSubmit()}
                  disabled={isPending}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 shadow-md shadow-violet-200/50 hover:shadow-lg hover:shadow-violet-300/50 transition-all py-6 font-medium"
                >
                  {isPending ? (
                    <motion.div
                      className="flex items-center gap-2"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </motion.div>
                  ) : (
                    <motion.div
                      className="flex items-center gap-2"
                      whileHover={{ x: 5 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                    >
                      Send Reset Link
                      <SendHorizontal className="h-4 w-4" />
                    </motion.div>
                  )}
                </Button>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Modal - adjusted styling */}
      <AnimatePresence>
        {showModal && (
          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogContent className="sm:max-w-md border-violet-200 shadow-xl shadow-violet-100/50 bg-gradient-to-b from-white to-violet-50">
              {/* Emoji Animation Container */}
              <DialogHeader>
                <div className="py-8 flex justify-center">
                  <AnimatePresence mode="wait">
                    {animationStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ scale: 0.5, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 1.5, opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="relative"
                      >
                        <motion.div
                          className="text-7xl"
                          animate={{
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 0.9, 1],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          🔮
                        </motion.div>
                        <motion.div
                          className="absolute -top-4 -right-4 text-3xl"
                          animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0],
                            y: [0, -15, -30],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatDelay: 0.5,
                          }}
                        >
                          ✨
                        </motion.div>
                      </motion.div>
                    )}
                    {animationStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-7xl"
                      >
                        <motion.div
                          animate={{
                            y: [0, -15, 0],
                            filter: [
                              "drop-shadow(0 0 0px rgba(139, 92, 246, 0))",
                              "drop-shadow(0 0 10px rgba(139, 92, 246, 0.7))",
                              "drop-shadow(0 0 0px rgba(139, 92, 246, 0))",
                            ],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatType: "reverse",
                          }}
                        >
                          ✨
                        </motion.div>
                      </motion.div>
                    )}
                    {animationStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-7xl"
                      >
                        <motion.div
                          animate={{
                            rotate: [0, 15, -15, 0],
                            y: [0, -10, 0],
                          }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          🚀
                        </motion.div>
                        <motion.div
                          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-2xl"
                          initial={{ opacity: 0, y: 0 }}
                          animate={{
                            opacity: [0, 1, 0],
                            y: [0, 20, 40],
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            repeatDelay: 0.1,
                          }}
                        >
                          🔥
                        </motion.div>
                      </motion.div>
                    )}
                    {animationStep >= 4 && (
                      <motion.div
                        key="step4"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="relative"
                      >
                        {/* Animated GIF for email sent confirmation */}
                        <div className="w-48 h-48">
                          <Lottie
                            animationData={emailSentAnimation}
                            loop={true}
                          />
                        </div>

                        {/* Animated sparkles around the GIF */}
                        <motion.div
                          className="absolute -top-4 -right-4 text-2xl"
                          animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0],
                            rotate: [0, 45, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 0.5,
                          }}
                        >
                          ✨
                        </motion.div>

                        <motion.div
                          className="absolute -bottom-2 -left-2 text-2xl"
                          animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0],
                            rotate: [0, -45, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 1,
                          }}
                        >
                          ✨
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <DialogTitle className="text-center text-xl text-gray-800 font-medium">
                  {animationStep < 4
                    ? "Sending Reset Link..."
                    : "Check Your Email"}
                </DialogTitle>

                {animationStep >= 4 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <DialogDescription className="text-center text-gray-600 font-normal">
                      We've sent password reset instructions to
                      <br />
                      <motion.span
                        className="font-medium text-gray-800"
                        animate={{
                          color: ["var(--violet)", "#a78bfa", "var(--violet)"],
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        {formik.values.email}
                      </motion.span>
                    </DialogDescription>
                  </motion.div>
                )}
              </DialogHeader>

              {animationStep >= 4 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <DialogFooter className="flex flex-col sm:flex-col gap-2 mt-4">
                    <Button
                      onClick={closeModal}
                      className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-md shadow-violet-200/50 hover:shadow-lg hover:shadow-violet-300/50 transition-all font-medium"
                    >
                      <motion.span
                        animate={{
                          textShadow: [
                            "0 0 0px rgba(255, 255, 255, 0)",
                            "0 0 5px rgba(255, 255, 255, 0.5)",
                            "0 0 0px rgba(255, 255, 255, 0)",
                          ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        Got it
                      </motion.span>
                    </Button>
                    <Button
                      onClick={tryAgain}
                      variant="outline"
                      className="w-full border-violet-200 text-violet-700 hover:bg-violet-50 hover:text-violet-900 hover:border-violet-300 font-medium"
                    >
                      Didn't receive it? Try again
                    </Button>
                  </DialogFooter>
                </motion.div>
              )}

              {/* Enhanced loading progress bar for steps 1-3 */}
              {animationStep < 4 && (
                <motion.div className="h-2 bg-violet-100 rounded-full overflow-hidden mt-4">
                  <motion.div
                    className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500"
                    initial={{ width: "0%" }}
                    animate={{ width: `${(animationStep / 4) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    style={{
                      backgroundSize: "200% 100%",
                      animation: "gradientShift 2s linear infinite",
                    }}
                  />
                </motion.div>
              )}
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ForgotPassword;