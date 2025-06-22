import React, { useState } from 'react';
import { Calendar, User, FileText} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToaster } from '@/hooks/ui/useToaster';
import { format } from 'date-fns';

export interface TrainerRequest {
  id: string;
  clientId: string;
  backupTrainerId: string;
  requestType: 'CHANGE' | 'REVOKE';
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  backupTrainer: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
}

interface TrainerRequestDashboardProps {
  requests: TrainerRequest[];
  onStatusChange: (requestId: string, newStatus: 'APPROVED' | 'REJECTED') => Promise<void>;
  isResolving: boolean;
}

const TrainerRequestTable: React.FC<TrainerRequestDashboardProps> = ({
  requests,
  onStatusChange,
}) => {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { successToast, errorToast } = useToaster();

  const handleStatusChange = async (requestId: string, newStatus: 'APPROVED' | 'REJECTED') => {
    setIsUpdating(requestId);
    try {
      await onStatusChange(requestId, newStatus);
      successToast(`Request has been ${newStatus.toLowerCase()}.`);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to update request status.';
      errorToast(errorMessage);
    } finally {
      setIsUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: 'bg-yellow-500 text-yellow-100 hover:bg-yellow-600',
      APPROVED: 'bg-green-500 text-green-100 hover:bg-green-600',
      REJECTED: 'bg-red-500 text-red-100 hover:bg-red-600',
    };

    return (
      <Badge className={`${variants[status as keyof typeof variants]} font-medium px-2 py-1 text-xs`}>
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy - hh:mm a');
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Sort requests by createdAt desc (latest first)
  const sortedRequests = [...requests].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="p-3 md:p-4 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Mobile Card Layout */}
        <div className="block lg:hidden space-y-3">
          {sortedRequests.map((request) => (
            <Card key={request.id} className="shadow-md hover:shadow-lg transition-all duration-200 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-gray-800">
                    {request.requestType} Request
                  </CardTitle>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Client Info */}
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                  <Avatar className="h-8 w-8 ring-2 ring-blue-100">
                    <AvatarImage src={request.client.profileImage} />
                    <AvatarFallback className="bg-blue-500 text-white font-medium text-xs">
                      {getInitials(request.client.firstName, request.client.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {request.client.firstName} {request.client.lastName}
                    </p>
                    <p className="text-xs text-gray-500">Client</p>
                  </div>
                </div>

                {/* Backup Trainer Info */}
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                  <Avatar className="h-8 w-8 ring-2 ring-green-100">
                    <AvatarImage src={request.backupTrainer.profileImage} />
                    <AvatarFallback className="bg-green-500 text-white font-medium text-xs">
                      {getInitials(request.backupTrainer.firstName, request.backupTrainer.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {request.backupTrainer.firstName} {request.backupTrainer.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {request.requestType === 'CHANGE' ? 'New Trainer' : 'Current Trainer'}
                    </p>
                  </div>
                </div>

                {/* Reason */}
                <div className="flex items-start space-x-2 p-2 bg-amber-50 rounded-lg border border-amber-100">
                  <FileText className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-amber-800">Reason</p>
                    <p className="text-xs text-amber-700">{request.reason}</p>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(request.createdAt)}</span>
                </div>

                {/* Action Dropdown */}
                {request.status === 'PENDING' && (
                  <select
                    className="w-full p-2 text-xs rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                    disabled={isUpdating === request.id}
                    onChange={(e) => {
                      const value = e.target.value as 'APPROVED' | 'REJECTED' | '';
                      if (value) {
                        handleStatusChange(request.id, value);
                      }
                    }}
                  >
                    <option value="">Update Status</option>
                    <option value="APPROVED">Approve</option>
                    <option value="REJECTED">Reject</option>
                  </select>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden lg:block">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Client</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Backup Trainer</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Reason</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-200 group"
                    >
                      {/* Client */}
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8 ring-2 ring-purple-100 group-hover:ring-purple-200 transition-all">
                            <AvatarImage src={request.client.profileImage} />
                            <AvatarFallback className="bg-purple-500 text-white font-medium text-xs">
                              {getInitials(request.client.firstName, request.client.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {request.client.firstName} {request.client.lastName}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Backup Trainer */}
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8 ring-2 ring-pink-100 group-hover:ring-pink-200 transition-all">
                            <AvatarImage src={request.backupTrainer.profileImage} />
                            <AvatarFallback className="bg-pink-500 text-white font-medium text-xs">
                              {getInitials(request.backupTrainer.firstName, request.backupTrainer.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {request.backupTrainer.firstName} {request.backupTrainer.lastName}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Request Type */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            request.requestType === 'CHANGE'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {request.requestType}
                        </span>
                      </td>

                      {/* Reason */}
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-700 max-w-xs truncate" title={request.reason}>
                          {request.reason}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">{getStatusBadge(request.status)}</td>

                      {/* Date */}
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-1 text-xs text-gray-600">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(request.createdAt)}</span>
                        </div>
                      </td>

                      {/* Action Dropdown */}
                      <td className="px-4 py-3">
                        {request.status === 'PENDING' ? (
                          <select
                            className="p-1 text-xs rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                            disabled={isUpdating === request.id}
                            onChange={(e) => {
                              const value = e.target.value as 'APPROVED' | 'REJECTED' | '';
                              if (value) {
                                handleStatusChange(request.id, value);
                              }
                            }}
                          >
                            <option value="">Select Action</option>
                            <option value="APPROVED">Approve</option>
                            <option value="REJECTED">Reject</option>
                          </select>
                        ) : (
                          <span className="text-xs text-gray-400">No action needed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {sortedRequests.length === 0 && (
          <div className="text-center py-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-600 text-sm">There are no trainer change requests at the moment.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerRequestTable;