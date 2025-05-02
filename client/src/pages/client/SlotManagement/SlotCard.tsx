"use client"

import type { ISlot } from "@/types/Slot"
import { cn } from "@/lib/utils"
import { Clock, Check, Calendar, X } from 'lucide-react'
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SlotCardProps {
  slot: ISlot
  isSelected: boolean
  onSelect: () => void
}

// Helper function to format time to AM/PM format
function formatToAmPm(time: string): string {
  // If time is already in correct format, return as is
  if (time.includes('AM') || time.includes('PM')) {
    return time;
  }
  
  // Parse the time assuming 24-hour format (HH:MM)
  const [hours, minutes] = time.split(':').map(part => parseInt(part, 10));
  
  // Convert to 12-hour format with AM/PM
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
  
  // Return formatted time
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function SlotCard({ slot, isSelected, onSelect }: SlotCardProps) {
  console.log("Slot data:", slot);
  
  // Convert status to uppercase to match the interface requirement
  const normalizedSlot = {
    ...slot,
    status: slot.status.toUpperCase() as 'AVAILABLE' | 'BOOKED' | 'CANCELLED' | 'COMPLETED'
  };
  
  const isAvailable = normalizedSlot.isAvailable && !normalizedSlot.isBooked

  // Format start and end times to AM/PM format
  const formattedStartTime = formatToAmPm(normalizedSlot.startTime);
  const formattedEndTime = formatToAmPm(normalizedSlot.endTime);

  return (
    <motion.div 
      whileHover={isAvailable ? { scale: 1.02, y: -5 } : {}}
      whileTap={isAvailable ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3,
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      className={cn(
        "p-6 border-2 rounded-2xl transition-all duration-300 backdrop-blur-sm",
        isSelected 
          ? "border-primary bg-primary/10 shadow-lg shadow-primary/20" 
          : isAvailable
            ? "border-gray-200 hover:border-primary/50 hover:shadow-lg"
            : normalizedSlot.isBooked
              ? "border-red-300 bg-red-50/80"
              : "border-gray-200 opacity-75 bg-gray-50/80",
        isAvailable 
          ? "cursor-pointer" 
          : "cursor-not-allowed",
      )}
      onClick={isAvailable ? onSelect : undefined}
    >
      {/* Date indicator with animated icon */}
      <div className="flex items-center text-sm text-gray-600 mb-3">
        <motion.div
          initial={{ rotate: -10 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Calendar className="h-4 w-4 mr-2" />
        </motion.div>
        <span>{normalizedSlot.date}</span>
      </div>

      {/* Time display with animated icon */}
      <div className="flex items-center text-lg font-medium text-gray-800 mb-4">
        <motion.div
          animate={{ 
            rotate: [0, 10, 0],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            repeatDelay: 5
          }}
        >
          <Clock className="h-5 w-5 mr-2 text-primary" />
        </motion.div>
        <span>
          {formattedStartTime} - {formattedEndTime}
        </span>
      </div>

      {/* Status indicator */}
      <StatusIndicator status={normalizedSlot.status} isSelected={isSelected} />

      {/* Bottom action area */}
      <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
        <div className="text-sm font-medium">
          {getSlotStatusText(normalizedSlot)}
        </div>
        
        {isAvailable && !isSelected && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-xs bg-primary/10 text-primary px-4 py-1.5 rounded-full hover:bg-primary/20 transition-colors font-medium"
                >
                  Select
                </motion.button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to select this time slot</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {isSelected && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-xs bg-primary text-white font-medium px-4 py-1.5 rounded-full flex items-center"
          >
            <Check className="h-3 w-3 mr-1" />
            Selected
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

function getSlotStatusText(slot: ISlot): string {
  if (slot.isBooked) return "This slot is already booked";
  if (!slot.isAvailable) return "This slot is unavailable";
  return "Available for booking";
}

interface StatusIndicatorProps {
  status: "AVAILABLE" | "BOOKED" | "CANCELLED" | "COMPLETED"
  isSelected: boolean
}

function StatusIndicator({ status, isSelected }: StatusIndicatorProps) {
  console.log(status, isSelected, "StatusIndicator");
  
  if (isSelected) {
    return (
      <motion.div 
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="flex items-center"
      >
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            boxShadow: [
              "0 0 0 0 rgba(79, 70, 229, 0.4)",
              "0 0 0 10px rgba(79, 70, 229, 0)",
              "0 0 0 0 rgba(79, 70, 229, 0)"
            ]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "loop"
          }}
          className="h-3 w-3 rounded-full bg-primary ring-4 ring-primary/20"
        />
        <span className="ml-2 text-sm font-medium text-primary">Selected</span>
      </motion.div>
    )
  }

  switch (status) {
    case "AVAILABLE":
      return (
        <motion.div 
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center"
        >
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              boxShadow: [
                "0 0 0 0 rgba(16, 185, 129, 0.4)",
                "0 0 0 10px rgba(16, 185, 129, 0)",
                "0 0 0 0 rgba(16, 185, 129, 0)"
              ]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "loop"
            }}
            className="h-3 w-3 rounded-full bg-green-500 ring-4 ring-green-100"
          />
          <span className="ml-2 text-sm font-medium text-green-600">Available</span>
        </motion.div>
      )
    case "BOOKED":
      return (
        <motion.div 
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center"
        >
          <div className="relative">
            <motion.div 
              className="h-3 w-3 rounded-full bg-red-500 ring-4 ring-red-100"
            />
            <motion.div
              animate={{
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
              className="absolute inset-0 rounded-full bg-red-500 blur-sm"
            />
          </div>
          <span className="ml-2 text-sm font-medium text-red-500">Already Booked</span>
        </motion.div>
      )
    case "CANCELLED":
      return (
        <motion.div 
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center"
        >
          <div className="relative">
            <X className="h-4 w-4 text-red-500" />
          </div>
          <span className="ml-2 text-sm font-medium text-red-500">Cancelled</span>
        </motion.div>
      )
    case "COMPLETED":
      return (
        <motion.div 
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center"
        >
          <div className="h-3 w-3 rounded-full bg-gray-500 ring-4 ring-gray-100"></div>
          <span className="ml-2 text-sm font-medium text-gray-500">Completed</span>
        </motion.div>
      )
    default:
      return null
  }
}