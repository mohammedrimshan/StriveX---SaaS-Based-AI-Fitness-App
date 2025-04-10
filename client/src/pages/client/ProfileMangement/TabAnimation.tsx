"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

// Animation variants for tab transitions
export const tabVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1], // Custom cubic-bezier for a bouncy feel
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: "anticipate",
    },
  },
}

// Animation variants for individual items within tabs
export const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
}

// Reusable animated tab content wrapper
interface AnimatedTabProps {
  children: ReactNode
  tabKey: string
}

export const AnimatedTab = ({ children, tabKey }: AnimatedTabProps) => {
  return (
    <motion.div key={tabKey} variants={tabVariants} initial="hidden" animate="visible" exit="exit">
      {children}
    </motion.div>
  )
}

// Reusable animated item wrapper for staggered animations
interface AnimatedItemProps {
  children: ReactNode
  className?: string
}

export const AnimatedItem = ({ children, className }: AnimatedItemProps) => {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  )
}

// Custom tab trigger with animation
interface AnimatedTabTriggerProps {
  children: ReactNode
  active?: boolean
}

export const AnimatedTabTrigger = ({ children, active }: AnimatedTabTriggerProps) => {
  return (
    <div className="relative overflow-hidden transition-all">
      {active && (
        <motion.div
          layoutId="tab-indicator"
          className="absolute inset-0 bg-violet-100 dark:bg-violet-900/30 rounded-md z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  )
}