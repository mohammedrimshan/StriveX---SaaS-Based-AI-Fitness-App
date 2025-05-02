"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  addDays,
  addMonths,
  format,
  isEqual,
  isSameMonth,
  isToday as isDateToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns"
import { CalendarDay } from "./CaledarDay"

interface CustomCalendarProps {
  selected: Date
  onSelect: (date: Date) => void
  datesWithSlots: Date[]
  disabledDates?: (date: Date) => boolean
}

export function CustomCalendar({ selected, onSelect, datesWithSlots = [], disabledDates }: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(startOfMonth(selected || new Date()))

  // Generate days for the current month view
  const days = React.useMemo(() => {
    const days = []
    const monthStart = startOfMonth(currentMonth)
    const weekStart = startOfWeek(monthStart, { weekStartsOn: 1 }) // Start on Monday

    let day = weekStart

    // Generate 42 days (6 weeks) to ensure we have enough days to display
    for (let i = 0; i < 42; i++) {
      days.push(day)
      day = addDays(day, 1)
    }

    return days
  }, [currentMonth])

  // Check if a date has slots
  const hasSlots = (date: Date) => {
    return datesWithSlots.some((d) => isEqual(d, date))
  }

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  // Day names
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  return (
    <div className="p-1">
      {/* Header with month and navigation */}
      <div className="flex items-center justify-between mb-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={prevMonth}
          className="p-2 rounded-full hover:bg-accent"
        >
          <ChevronLeft className="h-5 w-5" />
        </motion.button>

        <AnimatePresence mode="wait">
          <motion.h2
            key={currentMonth.toString()}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-lg font-medium"
          >
            {format(currentMonth, "MMMM yyyy")}
          </motion.h2>
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-accent"
        >
          <ChevronRight className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMonth.toString()}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-7 gap-1"
        >
          {days.map((day, index) => {
            const isOutsideMonth = !isSameMonth(day, currentMonth)
            const isDisabled = disabledDates ? disabledDates(day) : false
            const isSelected = isEqual(day, selected)
            const isToday = isDateToday(day)
            const hasSlotsForDay = hasSlots(day)

            return (
              <CalendarDay
                key={index}
                day={day}
                hasSlots={hasSlotsForDay}
                isSelected={isSelected}
                isToday={isToday}
                isOutsideMonth={isOutsideMonth}
                disabled={isDisabled || isOutsideMonth}
                onClick={() => !isDisabled && !isOutsideMonth && onSelect(day)}
              />
            )
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
