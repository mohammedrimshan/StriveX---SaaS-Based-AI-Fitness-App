"use client"

import React from "react";
import { FaCheck, FaStar, FaRegGem } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface EnhancedLoadingModalProps {
  isLoading: boolean;
  showSuccess: boolean;
  type: "workout" | "diet" | "mindfulness";
  icon: React.ReactNode;
  loadingText?: string;
  successText?: string;
}

export const LoadingModal = ({ 
  isLoading, 
  showSuccess, 
  type, 
  icon,
  loadingText = "Creating Your Perfect Plan",
  successText = "Plan generated successfully!"
}: EnhancedLoadingModalProps) => {
  const colors = {
    workout: {
      primary: "#7c3aed",
      secondary: "#a78bfa",
      bg: "#ddd6fe",
      accent: "#4c1d95"
    },
    diet: {
      primary: "#e11d48",
      secondary: "#fb7185",
      bg: "#fecdd3",
      accent: "#9f1239"
    },
    mindfulness: {
      primary: "#0ea5e9",
      secondary: "#7dd3fc",
      bg: "#e0f2fe",
      accent: "#0369a1"
    }
  };

  const themeColors = colors[type];

  // Particle elements for the loading animation
  const particles = Array(12).fill(0);

  if (!isLoading && !showSuccess) {
    return null;
  }

  return (
    <div className="absolute inset-0 bg-white/90 backdrop-blur-xl flex flex-col items-center justify-center z-20">
      <AnimatePresence>
        {isLoading ? (
          <motion.div 
            className="flex flex-col items-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Main loading animation container */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Outer pulsing circle */}
              <motion.div
                className="absolute inset-0 rounded-full opacity-30"
                style={{ backgroundColor: themeColors.bg }}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
              />
              
              {/* Middle spinning ring */}
              <motion.div 
                className="absolute w-28 h-28 rounded-full"
                style={{ 
                  border: `3px dashed ${themeColors.secondary}`,
                  boxShadow: `0 0 15px ${themeColors.primary}40`
                }}
                animate={{ rotate: 360 }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
              />
              
              {/* Spinning loader */}
              <motion.div 
                className="absolute w-24 h-24 rounded-full"
                style={{ 
                  border: `4px solid ${themeColors.bg}`, 
                  borderTopColor: themeColors.primary,
                  borderRightColor: themeColors.primary
                }}
                animate={{ rotate: -360 }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
              />
              
              {/* Particles around the circle */}
              <div className="absolute w-full h-full">
                {particles.map((_, index) => (
                  <motion.div
                    key={index}
                    className="absolute w-2 h-2 rounded-full"
                    style={{ 
                      backgroundColor: index % 2 === 0 ? themeColors.primary : themeColors.secondary,
                      top: '50%',
                      left: '50%',
                      margin: '-1px 0 0 -1px'
                    }}
                    animate={{
                      x: Math.sin(index * 30 * (Math.PI / 180)) * 50,
                      y: Math.cos(index * 30 * (Math.PI / 180)) * 50,
                      opacity: [0.2, 1, 0.2],
                      scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.1,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
              
              {/* Center icon */}
              <motion.div
                animate={{ 
                  scale: [1, 1.15, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative z-10 text-4xl"
                style={{ color: themeColors.primary }}
              >
                {icon}
              </motion.div>
            </div>
            
            {/* Text content */}
            <div className="mt-8 text-center">
              <motion.p 
                className="font-bold text-xl mb-2"
                style={{ color: themeColors.primary }}
                animate={{ 
                  color: [themeColors.primary, themeColors.accent, themeColors.primary]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {loadingText}
              </motion.p>
              <motion.p 
                className="text-gray-600 max-w-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Our AI is analyzing thousands of successful fitness programs to design your personalized plan...
              </motion.p>
            </div>
            
            {/* Progress dots */}
            <div className="mt-8 flex gap-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div 
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: themeColors.primary }}
                  animate={{ 
                    y: [0, -8, 0],
                    opacity: [0.5, 1, 0.5],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{ 
                    duration: 1,
                    repeat: Infinity, 
                    delay: i * 0.15,
                    ease: "easeInOut" 
                  }}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="flex flex-col items-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Success animation */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              {/* Expanding circle effect */}
              <motion.div 
                className="absolute inset-0 w-full h-full rounded-full bg-[#dcfce7]"
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: [0, 1.5], opacity: [0.8, 0] }}
                transition={{ duration: 1, times: [0, 1] }}
              />
              
              {/* Secondary expanding circle */}
              <motion.div 
                className="absolute inset-0 w-full h-full rounded-full bg-[#dcfce7]"
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: [0, 1.8], opacity: [0.8, 0] }}
                transition={{ duration: 1.5, delay: 0.2, times: [0, 1] }}
              />
              
              {/* Star particles */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{ 
                    x: 0, 
                    y: 0, 
                    scale: 0,
                    opacity: 0
                  }}
                  animate={{ 
                    x: Math.sin(i * 45 * (Math.PI / 180)) * 60,
                    y: Math.cos(i * 45 * (Math.PI / 180)) * 60,
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{ 
                    duration: 1,
                    delay: 0.4,
                    ease: "easeOut" 
                  }}
                >
                  {i % 2 === 0 ? 
                    <FaStar className="text-yellow-400 text-xl" /> : 
                    <FaRegGem className="text-emerald-400 text-xl" />
                  }
                </motion.div>
              ))}
              
              {/* Success check circle */}
              <motion.div 
                className="w-24 h-24 rounded-full bg-[#22c55e] flex items-center justify-center"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 20, 
                  delay: 0.2 
                }}
              >
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                >
                  <FaCheck className="text-4xl text-white" />
                </motion.div>
              </motion.div>
            </div>
            
            {/* Success text */}
            <motion.p 
              className="text-[#16a34a] font-bold text-xl mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, type: "spring" }}
            >
              {successText}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};