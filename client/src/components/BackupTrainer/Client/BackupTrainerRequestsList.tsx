import { User } from "lucide-react"

interface Request {
  id: string
  clientId: string
  backupTrainerId: string
  requestType: "CHANGE" | "REVOKE"
  reason?: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string
  resolvedAt?: string
  backupTrainer: {
    id: string
    firstName: string
    lastName: string
  }
}

interface BackupTrainerRequestsListProps {
  requests: Request[]
}

const BackupTrainerRequestsList = ({ requests }: BackupTrainerRequestsListProps) => {
  const getStatusBadgeClasses = (status: Request["status"]) => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold shadow-sm"

    switch (status) {
      case "PENDING":
        return `${baseClasses} bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 shadow-yellow-400/25`
      case "APPROVED":
        return `${baseClasses} bg-gradient-to-r from-green-400 to-emerald-400 text-green-900 shadow-green-400/25`
      case "REJECTED":
        return `${baseClasses} bg-gradient-to-r from-red-400 to-pink-400 text-red-900 shadow-red-400/25`
      default:
        return baseClasses
    }
  }

  const getRequestTypeBadgeClasses = (type: Request["requestType"]) => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-bold shadow-sm"

    switch (type) {
      case "CHANGE":
        return `${baseClasses} bg-gradient-to-r from-blue-400 to-cyan-400 text-blue-900 shadow-blue-400/25`
      case "REVOKE":
        return `${baseClasses} bg-gradient-to-r from-purple-400 to-pink-400 text-purple-900 shadow-purple-400/25`
      default:
        return baseClasses
    }
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-purple-300/30 shadow-lg">
          <User className="w-6 h-6 text-purple-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">No requests found</h3>
        <p className="text-gray-600 text-sm">There are no backup trainer requests to display.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <div
          key={request.id}
          className="backdrop-blur-xl bg-gradient-to-br from-white/90 to-gray-50/90 rounded-lg border border-gray-200/50 shadow-lg transition-all duration-300 hover:shadow-xl"
        >
          <div className="p-3">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500/30 to-pink-500/30 backdrop-blur-sm rounded-full flex items-center justify-center border border-purple-300/30 shadow-md">
                  <User className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-1">
                    {request.backupTrainer.firstName} {request.backupTrainer.lastName}
                  </h3>
                  <p className="text-purple-600 font-medium text-xs">Backup Trainer</p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <span className={getStatusBadgeClasses(request.status)}>{request.status}</span>
                <span className={getRequestTypeBadgeClasses(request.requestType)}>{request.requestType}</span>
              </div>
            </div>

            {request.reason && (
              <div className="mb-3">
                <h4 className="text-xs font-bold text-purple-600 mb-1 uppercase tracking-wider">Reason</h4>
                <p className="text-gray-700 text-xs bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-md p-2 border border-purple-300/20 shadow-inner">
                  {request.reason}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm rounded-md p-2 border border-indigo-300/20">
                <span className="font-bold text-indigo-600 text-xs uppercase tracking-wider block mb-1">Created</span>
                <p className="text-gray-700 font-medium text-xs">{new Date(request.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 backdrop-blur-sm rounded-md p-2 border border-pink-300/20">
                <span className="font-bold text-pink-600 text-xs uppercase tracking-wider block mb-1">Resolved</span>
                <p className="text-gray-700 font-medium text-xs">
                  {request.resolvedAt ? new Date(request.resolvedAt).toLocaleDateString() : "Not resolved yet"}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default BackupTrainerRequestsList
