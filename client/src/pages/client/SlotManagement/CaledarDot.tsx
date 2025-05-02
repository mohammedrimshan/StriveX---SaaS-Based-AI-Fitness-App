"use client"
import { motion } from "framer-motion"

interface CalendarDotProps {
  active?: boolean
}

export function CalendarDot({ active = false }: CalendarDotProps) {
  return (
    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex justify-center">
      {active ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{
            scale: [1, 1.3, 1],
            backgroundColor: ["#10B981", "#0D9488", "#10B981"],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
          className="h-1.5 w-1.5 rounded-full bg-green-500"
        />
      ) : (
        <div className="h-1.5 w-1.5 rounded-full bg-transparent" />
      )}
    </div>
  )
}
