"use client"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PaginationProps } from "@/types/Response"


export function Pagination({ currentPage, totalPages, onPageChange, maxVisiblePages = 5, className }: PaginationProps) {
  // Don't render pagination if there's only one page
  if (totalPages <= 1) return null

  // Calculate which page numbers to show
  const getVisiblePageNumbers = () => {
    // If we can show all pages
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    // Calculate the range of visible pages
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = startPage + maxVisiblePages - 1

    // Adjust if we're near the end
    if (endPage > totalPages) {
      endPage = totalPages
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)
  }

  const visiblePageNumbers = getVisiblePageNumbers()

  // Variants for animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      className={cn("flex items-center justify-center gap-1", className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Previous button */}
      <motion.div variants={itemVariants}>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full border-violet-200"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>
      </motion.div>

      {/* First page and ellipsis if needed */}
      {visiblePageNumbers[0] > 1 && (
        <>
          <motion.div variants={itemVariants}>
            <Button
              variant={currentPage === 1 ? "default" : "outline"}
              size="icon"
              className={cn(
                "h-10 w-10 rounded-full font-medium",
                currentPage === 1 ? "bg-violet-600 hover:bg-violet-700" : "border-violet-200 hover:border-violet-300",
              )}
              onClick={() => onPageChange(1)}
            >
              01
            </Button>
          </motion.div>

          {visiblePageNumbers[0] > 2 && (
            <motion.div variants={itemVariants} className="flex items-center justify-center w-10 h-10">
              <span className="text-muted-foreground">...</span>
            </motion.div>
          )}
        </>
      )}

      {/* Visible page numbers */}
      {visiblePageNumbers.map((pageNumber) => (
        <motion.div key={pageNumber} variants={itemVariants}>
          <Button
            variant={currentPage === pageNumber ? "default" : "outline"}
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full font-medium",
              currentPage === pageNumber
                ? "bg-violet-600 hover:bg-violet-700"
                : "border-violet-200 hover:border-violet-300",
            )}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber.toString().padStart(2, "0")}
          </Button>
        </motion.div>
      ))}

      {/* Last page and ellipsis if needed */}
      {visiblePageNumbers[visiblePageNumbers.length - 1] < totalPages && (
        <>
          {visiblePageNumbers[visiblePageNumbers.length - 1] < totalPages - 1 && (
            <motion.div variants={itemVariants} className="flex items-center justify-center w-10 h-10">
              <span className="text-muted-foreground">...</span>
            </motion.div>
          )}

          <motion.div variants={itemVariants}>
            <Button
              variant={currentPage === totalPages ? "default" : "outline"}
              size="icon"
              className={cn(
                "h-10 w-10 rounded-full font-medium",
                currentPage === totalPages
                  ? "bg-violet-600 hover:bg-violet-700"
                  : "border-violet-200 hover:border-violet-300",
              )}
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages.toString().padStart(2, "0")}
            </Button>
          </motion.div>
        </>
      )}

      {/* Next button */}
      <motion.div variants={itemVariants}>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full border-violet-200"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>
      </motion.div>
    </motion.div>
  )
}

