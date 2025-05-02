"use client"
import { motion } from "framer-motion"
import { CalendarDot } from "./CaledarDot"

interface CalendarDayProps {
  day: Date
  hasSlots: boolean
  isSelected: boolean
  isToday: boolean
  isOutsideMonth: boolean
  disabled: boolean
  onClick: () => void
}

export function CalendarDay({
  day,
  hasSlots,
  isSelected,
  isToday,
  isOutsideMonth,
  disabled,
  onClick,
}: CalendarDayProps) {
  const dayNumber = day.getDate()

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.1, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-9 h-9 rounded-full flex items-center justify-center text-sm
        ${isSelected ? "bg-primary text-primary-foreground font-medium" : ""}
        ${isToday && !isSelected ? "border border-primary text-primary font-medium" : ""}
        ${isOutsideMonth && !isSelected ? "text-muted-foreground opacity-50" : ""}
        ${disabled ? "text-muted-foreground opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${!isSelected && !disabled && !isOutsideMonth ? "hover:bg-accent" : ""}
      `}
    >
      {dayNumber}
      <CalendarDot active={hasSlots} />
    </motion.button>
  )
}
