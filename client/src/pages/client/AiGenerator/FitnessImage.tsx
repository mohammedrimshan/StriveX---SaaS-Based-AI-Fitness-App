"use client"

import { motion } from "framer-motion";

interface FitnessImageProps {
  type: "workout" | "diet";
}

export const FitnessImage = ({ type }: FitnessImageProps) => {
  const workoutImageUrl = "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80";
  const dietImageUrl = "https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80";
  
  const imageUrl = type === "workout" ? workoutImageUrl : dietImageUrl;
  
  return (
    <div className="relative w-full h-full min-h-[300px] overflow-hidden rounded-bl-3xl">
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
      <motion.div 
        className="absolute bottom-6 left-6 z-20 text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-sm font-medium uppercase tracking-wider mb-1 opacity-80">
          {type === "workout" ? "Exercise" : "Nutrition"}
        </p>
        <h3 className="text-2xl font-bold">
          {type === "workout" ? "Transform Your Body" : "Fuel Your Performance"}
        </h3>
      </motion.div>
      <motion.img
        src={imageUrl}
        alt={type === "workout" ? "Person working out" : "Healthy food"}
        className="absolute inset-0 w-full h-full object-cover"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.7 }}
      />
    </div>
  );
};