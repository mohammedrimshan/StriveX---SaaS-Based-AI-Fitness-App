import { useState } from "react"
import TrainerInvitationList from "./Client/TrainerInvitationList"
import { useClientBackupInvitations } from "@/hooks/backuptrainer/useClientBackupInvitations"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function UserTrainerInvitation() {
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading, isError } = useClientBackupInvitations(page, limit)

  if (isLoading) {
    return (
      <main className="py-8 px-4 text-center">
        <div className="text-gray-600">Loading trainer invitations...</div>
      </main>
    )
  }

  if (isError || !data) {
    return (
      <main className="py-8 px-4 text-center">
        <div className="text-red-600">Failed to load trainer invitations.</div>
      </main>
    )
  }

  const { invitations, totalPages }: any = data

  return (
    <main className="py-8 px-4">
      <TrainerInvitationList invitations={invitations} />
      
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
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
    </main>
  )
}