"use client"

import { motion } from "framer-motion"
import { Search, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TrainersEmptyStateProps {
  searchTerm?: string
}

export default function TrainersEmptyState({ searchTerm }: TrainersEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-4 mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        className="rounded-full bg-indigo-50 p-6 text-indigo-500 mb-4"
      >
        {searchTerm ? <Search className="w-10 h-10" /> : <UserX className="w-10 h-10" />}
      </motion.div>

      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        {searchTerm ? "No trainers found" : "No trainers available"}
      </h3>

      <p className="text-center text-gray-500 max-w-md mb-6">
        {searchTerm
          ? `We couldn't find any trainers matching "${searchTerm}". Try adjusting your search terms or filters.`
          : "There are currently no trainers available. Please check back later or try adjusting your filters."}
      </p>

      {searchTerm && (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
          >
            Clear search
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}

