"use client"

import type React from "react"
import { useState } from "react"
import { Calendar } from "lucide-react"
import { format } from "@/utils/dateUtils"

interface DatePickerProps {
  selected?: Date
  onSelect: (date: Date | undefined) => void
  placeholder: string
  label?: string
}

export const DatePicker: React.FC<DatePickerProps> = ({ 
  selected, 
  onSelect, 
  placeholder, 
  label 
}) => {
  const [inputValue, setInputValue] = useState(
    selected ? format(selected, "yyyy-MM-dd") : ""
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    if (value) {
      try {
        const date = new Date(value + "T00:00:00.000Z")
        if (!isNaN(date.getTime())) {
          onSelect(date)
        }
      } catch (error) {
        // Invalid date, ignore
      }
    } else {
      onSelect(undefined)
    }
  }

  return (
    <div className="w-full space-y-1 sm:space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 px-1">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <input
          type="date"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full px-3 py-2 sm:px-4 sm:py-3 pr-10 sm:pr-12 
                     border border-gray-300 rounded-md shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     text-sm sm:text-base
                     disabled:bg-gray-50 disabled:text-gray-500
                     [&::-webkit-calendar-picker-indicator]:opacity-0
                     [&::-webkit-calendar-picker-indicator]:absolute
                     [&::-webkit-calendar-picker-indicator]:right-2
                     [&::-webkit-calendar-picker-indicator]:w-5
                     [&::-webkit-calendar-picker-indicator]:h-5
                     [&::-webkit-calendar-picker-indicator]:cursor-pointer"
        />
        <Calendar 
          className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 
                     w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" 
        />
      </div>
    </div>
  )
}