"use client"

import { BackupInvitationStatus } from "@/types/backuptrainer"
import { format } from "date-fns"
import { Calendar, Clock, User } from "lucide-react"

interface Trainer {
  id: string
  firstName: string
  lastName: string
  specialization: string[]
}

interface Invitation {
  id: string
  clientId: string
  trainerId: string
  status: BackupInvitationStatus
  respondedAt?: string | null
  expiresAt: string
  isFallback: boolean
  sentAt: string
  trainer: Trainer
}

interface TrainerInvitationListProps {
  invitations: Invitation[]
}

// Status Badge Component
const StatusBadge = ({ status }: { status: BackupInvitationStatus }) => {
  const getStatusConfig = (status: BackupInvitationStatus) => {
    switch (status) {
      case BackupInvitationStatus.PENDING:
        return { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Pending" }
      case BackupInvitationStatus.ACCEPTED:
        return { color: "bg-green-100 text-green-800 border-green-200", label: "Accepted" }
      case BackupInvitationStatus.REJECTED:
        return { color: "bg-red-100 text-red-800 border-red-200", label: "Rejected" }
      case BackupInvitationStatus.AUTO_ASSIGNED:
        return { color: "bg-blue-100 text-blue-800 border-blue-200", label: "Auto Assigned" }
      default:
        return { color: "bg-gray-100 text-gray-800 border-gray-200", label: status }
    }
  }

  const config = getStatusConfig(status)

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      {config.label}
    </span>
  )
}

// Avatar Component
const TrainerAvatar = ({ firstName, lastName }: { firstName: string; lastName: string }) => {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()

  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
      {initials}
    </div>
  )
}

// Format Date Helper
const formatDate = (dateString: string) => {
  return format(new Date(dateString), "MMM dd, yyyy HH:mm")
}

// Mobile Card Component
const InvitationCard = ({ invitation }: { invitation: Invitation }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <TrainerAvatar firstName={invitation.trainer.firstName} lastName={invitation.trainer.lastName} />
          <div>
            <h3 className="font-semibold text-gray-900">
              {invitation.trainer.firstName} {invitation.trainer.lastName}
            </h3>
          </div>
        </div>
        <StatusBadge status={invitation.status} />
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-1">
          {invitation.trainer.specialization.map((spec, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs rounded-full"
            >
              {spec}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-purple-500" />
            <span>Sent: {formatDate(invitation.sentAt)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-pink-500" />
            <span>Expires: {formatDate(invitation.expiresAt)}</span>
          </div>
          {invitation.respondedAt && (
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-indigo-500" />
              <span>Responded: {formatDate(invitation.respondedAt)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Desktop Table Row Component
const InvitationTableRow = ({ invitation }: { invitation: Invitation }) => {
  return (
    <tr className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-3">
          <TrainerAvatar firstName={invitation.trainer.firstName} lastName={invitation.trainer.lastName} />
          <div>
            <div className="text-sm font-medium text-gray-900">
              {invitation.trainer.firstName} {invitation.trainer.lastName}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1">
          {invitation.trainer.specialization.map((spec, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs rounded-full"
            >
              {spec}
            </span>
          ))}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={invitation.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(invitation.sentAt)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(invitation.expiresAt)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {invitation.respondedAt ? formatDate(invitation.respondedAt) : "-"}
      </td>
    </tr>
  )
}

// Main Component
export default function TrainerInvitationList({ invitations }: TrainerInvitationListProps) {
  return (
    <div className="py-8 px-4">
      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-4">
        {invitations.map((invitation) => (
          <InvitationCard key={invitation.id} invitation={invitation} />
        ))}
      </div>

      {/* Desktop/Tablet View - Table */}
      <div className="hidden md:block">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trainer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sent At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responded At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invitations.map((invitation) => (
                <InvitationTableRow key={invitation.id} invitation={invitation} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {invitations.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-purple-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No invitations found</h3>
          <p className="text-gray-500">There are no trainer invitations to display at the moment.</p>
        </div>
      )}
    </div>
  )
}
