"use client"

import React, { useState } from "react"
import { Filter, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"

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
  userType?: "client" | "trainer"
  specializationOptions?: string[]
}

export function UserFilters({ activeFilters, setActiveFilters, userType = "client" }: UserFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const statusOptions = ["active", "blocked"]
  const baseColor = userType === "client" ? "violet" : "orange"

  // Toggle filter
  const toggleFilter = (value: string) => {
    setActiveFilters((prev) => {
      const currentValues = [...prev.status]
      const index = currentValues.indexOf(value)
      return {
        ...prev,
        status: index === -1 
          ? [...currentValues, value]
          : currentValues.filter(item => item !== value)
      }
    })
  }

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters({ status: [], specialization: []  })
  }

  // Remove specific filter
  const removeFilter = (value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      status: prev.status.filter(item => item !== value)
    }))
  }

  const totalActiveFilters = activeFilters.status.length
  const formatLabel = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

  return (
    <div className="relative flex flex-col items-end gap-2">
      {/* Filter Trigger Button */}
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <Button
          className={`flex items-center gap-2 border-${baseColor}-200 hover:border-${baseColor}-300 hover:bg-${baseColor}-50 transition-all duration-300`}
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <Filter className="h-4 w-4" />
          </motion.div>
          Filters
          <AnimatePresence>
            {totalActiveFilters > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Badge className={`ml-2 bg-${baseColor}-600 hover:bg-${baseColor}-700`}>
                  {totalActiveFilters}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className={`absolute top-12 right-0 w-64 bg-white border border-${baseColor}-200 rounded-md shadow-lg z-50 p-4 overflow-hidden`}
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
              <span className={`text-${baseColor}-700 font-medium`}>
                Filter {userType === "client" ? "Users" : "Trainers"}
              </span>
              {totalActiveFilters > 0 && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-${baseColor}-600 hover:text-${baseColor}-700`}
                    onClick={() => {
                      clearAllFilters()
                      setIsOpen(false)
                    }}
                  >
                    Clear All
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Status Filters */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Status</h3>
              <div className="space-y-2">
                {statusOptions.map((status, index) => (
                  <motion.div
                    key={status}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.1 }}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-${baseColor}-50 transition-colors duration-200`}
                    onClick={() => toggleFilter(status)}
                    whileHover={{ scale: 1.02, backgroundColor: `rgba(var(--${baseColor}-100), 0.5)` }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>{formatLabel(status)}</span>
                    <AnimatePresence>
                      {activeFilters.status.includes(status) && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Check className={`h-4 w-4 text-${baseColor}-600`} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filter Badges */}
      <div className="flex flex-wrap gap-2 mt-2">
        <AnimatePresence>
          {activeFilters.status.map((status) => (
            <motion.div
              key={`status-${status}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              layout
            >
              <Badge
                className={`bg-${baseColor}-50 text-${baseColor}-700 border-${baseColor}-200 flex items-center gap-1`}
              >
                Status: {formatLabel(status)}
                <motion.button
                  className={`ml-1 text-${baseColor}-700 hover:text-${baseColor}-900`}
                  onClick={() => removeFilter(status)}
                  whileHover={{ scale: 1.2, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-3 w-3" />
                </motion.button>
              </Badge>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}