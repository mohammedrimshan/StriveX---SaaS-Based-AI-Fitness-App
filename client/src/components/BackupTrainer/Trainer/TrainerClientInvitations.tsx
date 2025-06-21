"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronDown, User, Calendar, Target, Dumbbell, Clock, Check, X, Filter, ChevronUp } from "lucide-react"
import { useRespondToBackupInvitation } from "@/hooks/backuptrainer/useRespondToBackupInvitation"
import { useToaster } from "@/hooks/ui/useToaster"

interface Client {
  id: string
  firstName: string
  lastName: string
  profileImage: string
  preferedWorkout: string
  fitnessGoal: string
}

interface Invitation {
  id: string
  clientId: string
  trainerId: string
  status: "PENDING" | "ACCEPTED" | "REJECTED"
  respondedAt?: string
  expiresAt: string
  isFallback: boolean
  sentAt: string
  client: Client
}

interface TrainerInvitationsProps {
  invitations: Invitation[]
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

const formatText = (text: string) => {
  if (!text) return "N/A"
  const words = text.split(/(?=[A-Z])|_/)
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ")
}

const StatusBadge = ({
  status,
  onStatusChange,
  invitationId,
}: {
  status: string
  onStatusChange: (id: string, status: "ACCEPTED" | "REJECTED") => void
  invitationId: string
}) => {
  const handleStatusChange = (newStatus: "ACCEPTED" | "REJECTED") => {
    onStatusChange(invitationId, newStatus)
  }

  if (status === "ACCEPTED") {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-3 py-2 rounded-full text-xs font-medium border border-green-200 shadow-sm"
      >
        <motion.div initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ duration: 0.5 }}>
          <Check size={14} />
        </motion.div>
        <span>Accepted</span>
      </motion.div>
    )
  }

  if (status === "REJECTED") {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-1 bg-gradient-to-r from-red-100 to-rose-100 text-red-700 px-3 py-2 rounded-full text-xs font-medium border border-red-200 shadow-sm"
      >
        <motion.div initial={{ rotate: 0 }} animate={{ rotate: 180 }} transition={{ duration: 0.3 }}>
          <X size={14} />
        </motion.div>
        <span>Rejected</span>
      </motion.div>
    )
  }

  // Pending status with action buttons
  return (
    <div className="flex items-center gap-2">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-1 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 px-3 py-2 rounded-full text-xs font-medium border border-amber-200 shadow-sm"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        >
          <Clock size={14} />
        </motion.div>
        <span>Pending</span>
      </motion.div>

      <div className="flex items-center gap-1">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleStatusChange("ACCEPTED")}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-2 rounded-full shadow-sm transition-all duration-200 hover:shadow-md"
          title="Accept Invitation"
        >
          <Check size={12} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleStatusChange("REJECTED")}
          className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white p-2 rounded-full shadow-sm transition-all duration-200 hover:shadow-md"
          title="Reject Invitation"
        >
          <X size={12} />
        </motion.button>
      </div>
    </div>
  )
}

export default function TrainerInvitations({ invitations }: TrainerInvitationsProps) {
  const [sortField, setSortField] = useState<string>("sentAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const { mutate: respondToInvitation } = useRespondToBackupInvitation()
  const { successToast, errorToast } = useToaster()

  const handleStatusChange = (id: string, newStatus: "ACCEPTED" | "REJECTED") => {
    const action = newStatus === "ACCEPTED" ? "accept" : "reject"
    respondToInvitation(
      { invitationId: id, action },
      {
        onSuccess: (response) => {
          successToast(response.message || `Invitation ${action}ed successfully!`)
        },
        onError: (error: any) => {
          const errorMessage = error?.response?.data?.message || `Failed to ${action} invitation. Please try again.`
          errorToast(errorMessage)
        },
      }
    )
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const toggleRowExpand = (invitationId: string) => {
    setExpandedRow(expandedRow === invitationId ? null : invitationId)
  }

  const sortedInvitations = [...invitations].sort((a, b) => {
    if (sortField === "name") {
      const nameA = `${a.client.firstName} ${a.client.lastName}`.toLowerCase()
      const nameB = `${b.client.firstName} ${b.client.lastName}`.toLowerCase()
      return sortDirection === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
    } else if (sortField === "sentAt" || sortField === "respondedAt") {
      const timeA = a[sortField as keyof Invitation]
        ? new Date(a[sortField as keyof Invitation] as string).getTime()
        : 0
      const timeB = b[sortField as keyof Invitation]
        ? new Date(b[sortField as keyof Invitation] as string).getTime()
        : 0
      return sortDirection === "asc" ? timeA - timeB : timeB - timeA
    } else {
      const valueA = String(a[sortField as keyof Invitation] || "")
      const valueB = String(b[sortField as keyof Invitation] || "")
      return sortDirection === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueB)
    }
  })

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-12 mt-4 relative z-10">
      <div className="mt-6 sm:mt-8 max-w-full mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <h3 className="text-lg sm:text-xl font-bold flex items-center">
                <User className="mr-2" size={20} />
                <span>Training Invitations</span>
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-white/80 text-xs sm:text-sm">Showing {invitations.length} invitations</span>
                <div className="bg-white/20 p-2 rounded-full">
                  <Filter size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <table className="w-full table-fixed">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="w-1/6 px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SI No
                  </th>
                  <th
                    className="w-1/4 px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      Client Name
                      {sortField === "name" &&
                        (sortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                    </div>
                  </th>
                  <th className="w-1/6 px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preferred Workout
                  </th>
                  <th className="w-1/6 px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fitness Goal
                  </th>
                  <th className="w-1/4 px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status & Actions
                  </th>
                  <th
                    className="w-1/6 px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("sentAt")}
                  >
                    <div className="flex items-center">
                      Sent Date
                      {sortField === "sentAt" &&
                        (sortDirection === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedInvitations.map((invitation, index) => (
                  <>
                    <motion.tr
                      key={invitation.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className={`${
                        expandedRow === invitation.id ? "bg-indigo-50" : "hover:bg-gray-50"
                      } transition-colors duration-150 cursor-pointer`}
                      onClick={() => toggleRowExpand(invitation.id)}
                    >
                      <td className="px-2 sm:px-4 py-2 sm:py-4">
                        <div className="font-semibold text-gray-900">{index + 1}</div>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full overflow-hidden">
                            {invitation.client.profileImage ? (
                              <img
                                src={invitation.client.profileImage || "/placeholder.svg"}
                                alt={`${invitation.client.firstName} ${invitation.client.lastName}`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-xs sm:text-sm">
                                {invitation.client.firstName.charAt(0)}
                                {invitation.client.lastName.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="ml-2 sm:ml-4 flex-1 min-w-0">
                            <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                              {invitation.client.firstName} {invitation.client.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-4">
                        <div className="flex items-center">
                          <Dumbbell size={14} className="text-indigo-500 mr-1 sm:mr-2 flex-shrink-0" />
                          <span className="text-xs sm:text-sm text-gray-900 truncate">
                            {formatText(invitation.client.preferedWorkout)}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-4">
                        <div className="flex items-center">
                          <Target size={14} className="text-purple-500 mr-1 sm:mr-2 flex-shrink-0" />
                          <span className="text-xs sm:text-sm text-gray-900 truncate">
                            {formatText(invitation.client.fitnessGoal)}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-4" onClick={(e) => e.stopPropagation()}>
                        <StatusBadge
                          status={invitation.status}
                          onStatusChange={handleStatusChange}
                          invitationId={invitation.id}
                        />
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-4">
                        <div className="text-xs sm:text-sm text-gray-900">{formatDate(invitation.sentAt)}</div>
                        <div className="text-xs text-gray-500">{formatTime(invitation.sentAt)}</div>
                      </td>
                    </motion.tr>

                    {expandedRow === invitation.id && (
                      <tr>
                        <td colSpan={6} className="px-2 sm:px-4 py-2 sm:py-4 bg-indigo-50/70">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                              <div className="text-xs text-gray-500 mb-1">Invitation Sent</div>
                              <div className="flex items-center">
                                <Calendar size={14} className="text-indigo-500 mr-2 flex-shrink-0" />
                                <span className="text-xs sm:text-sm">
                                  {formatDate(invitation.sentAt)} at {formatTime(invitation.sentAt)}
                                </span>
                              </div>
                            </div>
                            {invitation.respondedAt && (
                              <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                                <div className="text-xs text-gray-500 mb-1">Response Date</div>
                                <div className="flex items-center">
                                  <Clock size={14} className="text-purple-500 mr-2 flex-shrink-0" />
                                  <span className="text-xs sm:text-sm">
                                    {formatDate(invitation.respondedAt)} at {formatTime(invitation.respondedAt)}
                                  </span>
                                </div>
                              </div>
                            )}
                            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                              <div className="text-xs text-gray-500 mb-1">Expires On</div>
                              <div className="flex items-center">
                                <Calendar size={14} className="text-red-500 mr-2 flex-shrink-0" />
                                <span className="text-xs sm:text-sm">{formatDate(invitation.expiresAt)}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="block lg:hidden space-y-4 p-4">
            {sortedInvitations.map((invitation, index) => (
              <motion.div
                key={invitation.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
                className={`border border-gray-200 rounded-lg shadow-sm p-4 ${
                  expandedRow === invitation.id ? "bg-indigo-50" : "bg-white"
                } transition-colors duration-150 cursor-pointer`}
                onClick={() => toggleRowExpand(invitation.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                      {invitation.client.profileImage ? (
                        <img
                          src={invitation.client.profileImage || "/placeholder.svg"}
                          alt={`${invitation.client.firstName} ${invitation.client.lastName}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                          {invitation.client.firstName.charAt(0)}
                          {invitation.client.lastName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {invitation.client.firstName} {invitation.client.lastName}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center">
                    <Dumbbell size={14} className="text-indigo-500 mr-2 flex-shrink-0" />
                    <span>
                      <strong>Preferred Workout:</strong> {formatText(invitation.client.preferedWorkout)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Target size={14} className="text-purple-500 mr-2 flex-shrink-0" />
                    <span>
                      <strong>Fitness Goal:</strong> {formatText(invitation.client.fitnessGoal)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Calendar size={14} className="text-indigo-500 mr-2 flex-shrink-0" />
                    <span>
                      <strong>Sent:</strong> {formatDate(invitation.sentAt)} at {formatTime(invitation.sentAt)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex justify-center" onClick={(e) => e.stopPropagation()}>
                  <StatusBadge
                    status={invitation.status}
                    onStatusChange={handleStatusChange}
                    invitationId={invitation.id}
                  />
                </div>

                {expandedRow === invitation.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="space-y-4">
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="text-xs text-gray-500 mb-1">Invitation Sent</div>
                        <div className="flex items-center">
                          <Calendar size={14} className="text-indigo-500 mr-2 flex-shrink-0" />
                          <span className="text-sm">
                            {formatDate(invitation.sentAt)} at {formatTime(invitation.sentAt)}
                          </span>
                        </div>
                      </div>
                      {invitation.respondedAt && (
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <div className="text-xs text-gray-500 mb-1">Response Date</div>
                          <div className="flex items-center">
                            <Clock size={14} className="text-purple-500 mr-2 flex-shrink-0" />
                            <span className="text-sm">
                              {formatDate(invitation.respondedAt)} at {formatTime(invitation.respondedAt)}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="text-xs text-gray-500 mb-1">Expires On</div>
                        <div className="flex items-center">
                          <Calendar size={14} className="text-red-500 mr-2 flex-shrink-0" />
                          <span className="text-sm">{formatDate(invitation.expiresAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {invitations.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <User size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No invitations</h3>
              <p className="mt-1 text-sm text-gray-500">There are no trainer invitations at this time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}