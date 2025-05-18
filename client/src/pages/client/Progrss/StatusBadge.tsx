"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"

interface StatusBadgeProps {
  variant: "success" | "secondary" | "destructive" | "outline"
  children: ReactNode
  className?: string
}

export default function StatusBadge({ variant, children, className = "" }: StatusBadgeProps) {
  const getBgColor = () => {
    switch (variant) {
      case "success":
        return "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-emerald-200"
      case "secondary":
        return "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-amber-200"
      case "destructive":
        return "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-red-200"
      case "outline":
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200 shadow-gray-100"
    }
  }

  return (
    <motion.span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm ${getBgColor()} ${className}`}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{
        scale: 1.05,
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      }}
    >
      {children}
    </motion.span>
  )
}
