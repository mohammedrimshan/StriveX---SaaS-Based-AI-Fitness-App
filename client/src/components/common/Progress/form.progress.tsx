"use client"

import { motion } from "framer-motion"
import { FormProgressProps } from "@/types/Response"

const FormProgress = ({ currentStep, totalSteps, onStepClick }: FormProgressProps) => {
  return (
    <div className="flex space-x-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <motion.button
          key={index}
          onClick={() => onStepClick(index)}
          className={`w-3 h-3 rounded-full ${currentStep === index ? "bg-purple-600" : "bg-purple-200"}`}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * index }}
        />
      ))}
    </div>
  )
}

export default FormProgress

