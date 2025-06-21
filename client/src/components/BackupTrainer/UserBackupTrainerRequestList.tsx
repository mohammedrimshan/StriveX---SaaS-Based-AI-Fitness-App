import { useState } from "react"
import BackupTrainerRequestsList from "./Client/BackupTrainerRequestsList"
import { useClientTrainerChangeRequests } from "@/hooks/backuptrainer/useClientTrainerChangeRequests"
import { ChevronLeft, ChevronRight } from "lucide-react"

const UserBackupTrainerRequestList = () => {
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading, isError } = useClientTrainerChangeRequests(page, limit)

  if (isLoading) {
    return (
      <div className="py-8 px-4 text-center">
        <div className="text-gray-600">Loading trainer change requests...</div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="py-8 px-4 text-center">
        <div className="text-red-600">Failed to load trainer change requests.</div>
      </div>
    )
  }

  const { requests, totalPages }:any = data

  return (
    <div className="py-8 px-4">
      <BackupTrainerRequestsList requests={requests} />
      
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
    </div>
  )
}

export default UserBackupTrainerRequestList