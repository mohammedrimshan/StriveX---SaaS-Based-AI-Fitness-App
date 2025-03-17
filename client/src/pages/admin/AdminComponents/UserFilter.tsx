"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Filter, X, Check, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserFiltersProps {
  activeFilters: {
    status: string[]
    specialization: string[]
  }
  setActiveFilters: React.Dispatch<
    React.SetStateAction<{
      status: string[]
      specialization: string[]
    }>
  >
}

// Available filter options
const statusOptions = ["Active", "Inactive"]
const specializationOptions = ["Yoga", "Meditation", "Workout", "Cardio", "Running"]

export function UserFilters({ activeFilters, setActiveFilters }: UserFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Toggle a filter option
  const toggleFilter = (type: "status" | "specialization", value: string) => {
    setActiveFilters((prev) => {
      const currentValues = [...prev[type]]
      const index = currentValues.indexOf(value)

      if (index === -1) {
        // Add the value
        return {
          ...prev,
          [type]: [...currentValues, value],
        }
      } else {
        // Remove the value
        currentValues.splice(index, 1)
        return {
          ...prev,
          [type]: currentValues,
        }
      }
    })
  }

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters({
      status: [],
      specialization: [],
    })
  }

  // Count total active filters
  const totalActiveFilters = activeFilters.status.length + activeFilters.specialization.length

  // Remove a specific filter
  const removeFilter = (type: "status" | "specialization", value: string) => {
    setActiveFilters((prev) => {
      const currentValues = [...prev[type]]
      const index = currentValues.indexOf(value)

      if (index !== -1) {
        currentValues.splice(index, 1)
        return {
          ...prev,
          [type]: currentValues,
        }
      }

      return prev
    })
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-violet-200 hover:border-violet-300 hover:bg-violet-50">
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {totalActiveFilters > 0 && (
                <Badge className="ml-2 bg-violet-600 hover:bg-violet-700">{totalActiveFilters}</Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 border-violet-200" align="end">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-violet-600" />
                Filter Users
              </span>
              {totalActiveFilters > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-violet-600 hover:text-violet-700 hover:bg-violet-50"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    clearAllFilters()
                  }}
                >
                  Clear all
                </Button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">Status</DropdownMenuLabel>
              {statusOptions.map((status) => (
                <DropdownMenuItem
                  key={status}
                  className="flex items-center justify-between cursor-pointer"
                  onSelect={(e) => {
                    e.preventDefault()
                    toggleFilter("status", status)
                  }}
                >
                  <span>{status}</span>
                  {activeFilters.status.includes(status) && <Check className="h-4 w-4 text-violet-600" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">Specialization</DropdownMenuLabel>
              {specializationOptions.map((spec) => (
                <DropdownMenuItem
                  key={spec}
                  className="flex items-center justify-between cursor-pointer"
                  onSelect={(e) => {
                    e.preventDefault()
                    toggleFilter("specialization", spec)
                  }}
                >
                  <span>{spec}</span>
                  {activeFilters.specialization.includes(spec) && <Check className="h-4 w-4 text-violet-600" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active filter badges */}
      {totalActiveFilters > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="flex flex-wrap gap-2 mt-2"
        >
          <AnimatePresence>
            {activeFilters.status.map((status) => (
              <motion.div
                key={`status-${status}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Badge
                  variant="outline"
                  className="bg-violet-50 text-violet-700 border-violet-200 flex items-center gap-1"
                >
                  Status: {status}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1 text-violet-700 hover:text-violet-900 hover:bg-transparent"
                    onClick={() => removeFilter("status", status)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {status} filter</span>
                  </Button>
                </Badge>
              </motion.div>
            ))}

            {activeFilters.specialization.map((spec) => (
              <motion.div
                key={`spec-${spec}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Badge
                  variant="outline"
                  className="bg-violet-50 text-violet-700 border-violet-200 flex items-center gap-1"
                >
                  Specialization: {spec}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1 text-violet-700 hover:text-violet-900 hover:bg-transparent"
                    onClick={() => removeFilter("specialization", spec)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {spec} filter</span>
                  </Button>
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}

