"use client"

import { motion } from "framer-motion"
import type { ISlot } from "@/types/Slot"
import { SlotCard } from "./SlotCard"

interface SlotListProps {
  slots: ISlot[]
  selectedSlot: string | null
  onSelectSlot: (slotId: string) => void
}

export function SlotList({ slots, selectedSlot, onSelectSlot }: SlotListProps) {
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <motion.div 
      className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {slots.map((slot, index) => (
        <motion.div 
          key={slot.id || index} 
          className="w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.4,
            delay: index * 0.05 
          }}
        >
          <SlotCard
            slot={slot}
            isSelected={selectedSlot === slot.id}
            onSelect={() => {
              if (slot.isAvailable && !slot.isBooked) {
                onSelectSlot(slot.id)
              }
            }}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}