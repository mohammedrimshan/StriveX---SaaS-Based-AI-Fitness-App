"use client"

import { useState } from "react"
import TrainerInvitations from "./Trainer/TrainerClientInvitations"
import { useTrainerBackupInvitations } from "@/hooks/backuptrainer/useTrainerBackupInvitations"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function TrainerClientInvitation() {
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading, isError } = useTrainerBackupInvitations(page, limit)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading trainer invitations...</div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Failed to load trainer invitations.</div>
      </div>
    )
  }

  const { invitations, totalPages } :any= data

  return (
    <div className="min-h-screen">
      <TrainerInvitations invitations={invitations} />
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4 pb-8">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="p-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="p-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  )
}