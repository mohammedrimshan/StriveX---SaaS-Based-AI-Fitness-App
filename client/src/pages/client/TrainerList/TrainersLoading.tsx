// src/components/trainers/TrainersLoading.tsx
import React from 'react';
import { motion } from 'framer-motion';

const TrainersLoading: React.FC = () => {
  // Create an array of placeholders
  const placeholders = Array(6).fill(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {placeholders.map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="bg-white rounded-lg overflow-hidden shadow-md"
        >
          {/* Animated loading bar at the top */}
          <div className="relative w-full h-1 bg-gray-200 overflow-hidden">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ 
                repeat: Infinity, 
                duration: 1.5,
                ease: "linear"
              }}
              className="absolute inset-y-0 left-0 w-1/3 bg-blue-500"
            />
          </div>
          
          {/* Image placeholder */}
          <div className="h-48 bg-gray-200 animate-pulse" />
          
          {/* Content placeholders */}
          <div className="p-4">
            <div className="h-6 bg-gray-200 rounded-md animate-pulse mb-4 w-3/4" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded-md animate-pulse w-full" />
              <div className="h-4 bg-gray-200 rounded-md animate-pulse w-5/6" />
              <div className="h-4 bg-gray-200 rounded-md animate-pulse w-4/6" />
            </div>
            <div className="mt-4">
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
              </div>
            </div>
            <div className="h-10 bg-gray-200 rounded-md animate-pulse mt-4" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default TrainersLoading;