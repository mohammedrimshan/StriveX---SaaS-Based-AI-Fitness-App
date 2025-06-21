
"use client";

import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
  const handleNavigate = () => {
    console.log("Navigate to premium page");
     navigate("/premium");
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.7, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative bg-white rounded-2xl p-4 sm:p-6 max-w-sm sm:max-w-md w-full shadow-xl border border-gray-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated background elements */}
        <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-3 -left-3 w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full opacity-5 animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Crown/Premium Icon Animation */}
        <div className="flex justify-center mb-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring", damping: 20, stiffness: 300 }}
            className="relative"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-white text-2xl"
              >
                👑
              </motion.div>
            </div>
            {/* Sparkle effects */}
            <motion.div
              animate={{ 
                scale: [0, 1, 0],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-1 -right-1 text-yellow-400 text-lg"
            >
              ✨
            </motion.div>
            <motion.div
              animate={{ 
                scale: [0, 1, 0],
                rotate: [0, -180, -360]
              }}
              transition={{ 
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
              className="absolute -bottom-1 -left-1 text-purple-400 text-sm"
            >
              ⭐
            </motion.div>
          </motion.div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Unlock Premium Content
          </h2>
          
          <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed px-2">
            This exclusive workout is part of our premium collection. Join thousands of users who've transformed their fitness journey!
          </p>

          {/* Features list */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mb-4 sm:mb-6 space-y-2"
          >
            {[
              { icon: "🎯", text: "Exclusive workouts" },
              { icon: "📊", text: "Progress tracking" },
              { icon: "🏆", text: "Personal guidance" },
              { icon: "🎵", text: "Premium playlists" }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-center justify-center gap-2 text-gray-700 text-sm sm:text-base"
              >
                <span className="text-base sm:text-lg">{feature.icon}</span>
                <span className="font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-col gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(147, 51, 234, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNavigate}
              className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold text-sm sm:text-base shadow-lg transition-all duration-300"
            >
              <motion.div
                className="absolute inset-0 bg-white opacity-0 hover:opacity-20"
                whileHover={{ opacity: 0.2 }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative flex items-center justify-center gap-2">
                <span>Upgrade to Premium</span>
                <motion.span
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-sm"
                >
                  🚀
                </motion.span>
              </span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium text-sm sm:text-base hover:border-purple-300 hover:text-purple-600 transition-all duration-300"
            >
              Maybe Later
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Close button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all duration-200 text-sm"
        >
          ✕
        </motion.button>

        {/* Floating particles animation */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-400 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -40, -20],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};
