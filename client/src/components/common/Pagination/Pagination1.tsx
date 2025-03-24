"use client"

import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from "@/lib/utils"

type PaginationProps = {
  currentPage: number
  totalPages: number
  onPagePrev: () => void
  onPageNext: () => void
  onPageSelect?: (page: number) => void
}

export const Pagination1: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPagePrev,
  onPageNext,
  onPageSelect,
}) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max to show
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)
      
      // Calculate start and end of page range around current page
      let start = Math.max(2, currentPage - 1)
      let end = Math.min(totalPages - 1, currentPage + 1)
      
      // Adjust if we're near the beginning
      if (currentPage <= 3) {
        end = Math.min(totalPages - 1, 4)
      }
      
      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - 3)
      }
      
      // Add ellipsis before middle pages if needed
      if (start > 2) {
        pages.push(-1) // -1 represents ellipsis
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      // Add ellipsis after middle pages if needed
      if (end < totalPages - 1) {
        pages.push(-2) // -2 represents ellipsis
      }
      
      // Always show last page
      pages.push(totalPages)
    }
    
    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <motion.div
      className="flex items-center justify-center gap-1 mt-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.button
        className="flex items-center justify-center w-9 h-9 rounded-md border border-border text-foreground hover:bg-accent disabled:opacity-50 disabled:pointer-events-none"
        disabled={currentPage === 1}
        onClick={onPagePrev}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </motion.button>
      
      {pageNumbers.map((page, index) => {
        if (page < 0) {
          // Render ellipsis
          return (
            <motion.span
              key={`ellipsis-${index}`}
              className="flex items-center justify-center w-9 h-9 text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              &hellip;
            </motion.span>
          )
        }
        
        return (
          <motion.button
            key={`page-${page}`}
            className={cn(
              "flex items-center justify-center w-9 h-9 rounded-md text-sm font-medium",
              currentPage === page 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-accent text-foreground"
            )}
            onClick={() => onPageSelect?.(page)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ 
              delay: index * 0.05,
              duration: 0.2
            }}
          >
            {page}
          </motion.button>
        )
      })}
      
      <motion.button
        className="flex items-center justify-center w-9 h-9 rounded-md border border-border text-foreground hover:bg-accent disabled:opacity-50 disabled:pointer-events-none"
        disabled={currentPage === totalPages}
        onClick={onPageNext}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </motion.button>
    </motion.div>
  )
}
