"use client"

import React from "react";
import { motion } from "framer-motion";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}

interface FeatureCardsProps {
  features: Feature[];
}

export const FeatureCards = ({ features }: FeatureCardsProps) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {features.map((feature, index) => (
        <motion.div 
          key={index}
          className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow group"
          variants={item}
        >
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
            style={{ backgroundColor: feature.bgColor }}
          >
            <span style={{ color: feature.color }}>{feature.icon}</span>
          </div>
          <div>
            <h4 className="font-medium text-gray-800">{feature.title}</h4>
            <p className="text-xs text-gray-500">{feature.description}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};