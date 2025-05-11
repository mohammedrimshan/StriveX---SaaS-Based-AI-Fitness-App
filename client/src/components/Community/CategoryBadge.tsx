"use client"

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CategoryBadgeProps {
  category: string;
  isTrainer?: boolean;
  className?: string;
}

const CategoryBadge = ({ category, isTrainer = false, className }: CategoryBadgeProps) => {
  // Different styling based on trainer vs regular user
  const baseClasses = "px-2.5 py-0.5 rounded-full text-xs font-medium";

  return (
    <motion.span 
      className={cn(
        baseClasses,
        isTrainer 
          ? "bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white shadow-sm shadow-violet-500/20"
          : "bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-pink-500/20 text-slate-200 border border-violet-500/30",
        className
      )}
      whileHover={{ scale: 1.1 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      {category}
    </motion.span>
  );
};

export default CategoryBadge;
