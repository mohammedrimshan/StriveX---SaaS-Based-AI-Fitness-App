"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

interface AnimatedButtonProps {
  text: string
  icon?: React.ReactNode
  onClick?: () => void
}

export default function AnimatedButton({ text, icon, onClick }: AnimatedButtonProps) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />

      <Button
        onClick={onClick}
        className="relative px-8 py-6 bg-white dark:bg-gray-900 rounded-xl leading-none flex items-center divide-x divide-gray-600 shadow-xl group"
      >
        <span className="flex items-center space-x-3 pr-6">
          <span className="text-lg font-medium text-indigo-600 dark:text-indigo-400">{text}</span>
        </span>
        {icon && (
          <span className="pl-6 text-indigo-400 group-hover:text-indigo-500 transition duration-200">{icon}</span>
        )}
      </Button>
    </motion.div>
  )
}

