// src/components/ui/CustomToast.tsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import { toast } from "react-hot-toast";
import successAnimation from "@/assets/success.json";
import errorAnimation from "@/assets/error.json";
import infoAnimation from "@/assets/info.json";

interface CustomToastProps {
  message: string;
  type: "success" | "error" | "info";
  toastId: string;
}

export const CustomToast: React.FC<CustomToastProps> = ({ message, type, toastId }) => {
  const [isExiting, setIsExiting] = useState(false);
  const AUTO_DISMISS_DURATION = 2700; // 3000ms - 300ms (animation duration)
  const EXIT_ANIMATION_DURATION = 300; // Matches exit transition duration in ms

  const animationData =
    type === "success" ? successAnimation : type === "error" ? errorAnimation : infoAnimation;
  const iconColor =
    type === "success" ? "text-green-600" : type === "error" ? "text-red-600" : "text-blue-600";
  const textColor =
    type === "success" ? "text-green-700" : type === "error" ? "text-red-700" : "text-blue-700";

  const toastVariants = {
    initial: {
      opacity: 0,
      y: -50, // Entrance: Drop down from above
    },
    animate: {
      opacity: 1,
      y: 0, // Final position
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      x: 100, // Exit: Slide to the right
      transition: {
        duration: 0.3, // 300ms for visibility
        ease: "easeIn",
      },
    },
  };

  // Handle manual dismissal (clicking "✕")
  const handleDismiss = () => {
    setIsExiting(true);
  };

  // Auto-dismiss after duration
  useEffect(() => {
    const autoDismissTimer = setTimeout(() => {
      setIsExiting(true); // Trigger exit animation before duration expires
    }, AUTO_DISMISS_DURATION);

    return () => clearTimeout(autoDismissTimer);
  }, [AUTO_DISMISS_DURATION]);

  // Dismiss the toast after the exit animation completes
  useEffect(() => {
    if (isExiting) {
      const dismissTimer = setTimeout(() => {
        toast.dismiss(toastId);
      }, EXIT_ANIMATION_DURATION); // Wait for animation to finish
      return () => clearTimeout(dismissTimer);
    }
  }, [isExiting, toastId, EXIT_ANIMATION_DURATION]);

  return (
    <motion.div
      variants={toastVariants}
      initial="initial"
      animate={isExiting ? "exit" : "animate"}
      onAnimationComplete={(definition) => {
        if (definition === "exit" && isExiting) {
          toast.dismiss(toastId); // Ensure dismissal after animation
        }
      }}
      className="flex items-center gap-3 p-4 rounded-lg shadow-lg bg-white border border-gray-200 max-w-md"
    >
      <Lottie animationData={animationData} loop={false} className={`w-10 h-10 ${iconColor}`} />
      <span className={`text-base font-semibold ${textColor}`}>{message}</span>
      <button
        className="ml-auto text-gray-500 hover:text-gray-700"
        onClick={handleDismiss}
      >
        ✕
      </button>
    </motion.div>
  );
};