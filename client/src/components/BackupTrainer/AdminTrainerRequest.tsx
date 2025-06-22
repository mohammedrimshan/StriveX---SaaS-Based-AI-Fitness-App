"use client"

import { useState } from 'react';
import TrainerRequestDashboard, { TrainerRequest } from './Admin/TrainerRequestTable';
import { useAllTrainerChangeRequests } from '@/hooks/backuptrainer/useAllTrainerChangeRequests';
import { useResolveTrainerChangeRequest } from '@/hooks/backuptrainer/useResolveTrainerChangeRequest';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, ArrowLeft, ArrowRight } from 'lucide-react';

const AdminTrainerRequest = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");
  const { mutate: resolveRequest, isPending: isResolving } = useResolveTrainerChangeRequest();

  const { data, isLoading, isError, error } = useAllTrainerChangeRequests({ page, limit, status });

  const requests = data?.requests || [];
  const totalPages = data?.totalPages || 1;

  const filteredRequests = requests.filter((request: TrainerRequest) =>
    `${request.client.firstName} ${request.client.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    `${request.backupTrainer.firstName} ${request.backupTrainer.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusChange = async (requestId: string, newStatus: 'APPROVED' | 'REJECTED') => {
    const action = newStatus === 'APPROVED' ? 'approve' : 'reject';
    resolveRequest({ requestId, action });
  };

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="min-h-screen py-6 px-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto">
        {/* Search and Filter */}
        <motion.div
          className="mb-6 bg-white rounded-xl shadow-lg p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by client or trainer name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <Select onValueChange={(value) => setStatus(value === 'all' ? undefined : value)} value={status || 'all'}>
              <SelectTrigger className="w-full sm:w-48 border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-white rounded-xl shadow-md animate-pulse flex items-center px-6">
                <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                <div className="ml-4 flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Error State */}
        {isError && (
          <motion.div
            className="text-center p-8 bg-white rounded-xl shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-red-600 font-medium">
              Error: {error?.message || "Failed to fetch trainer change requests"}
            </p>
          </motion.div>
        )}

        {/* Request Dashboard */}
        {!isLoading && !isError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <TrainerRequestDashboard
              requests={filteredRequests}
              onStatusChange={handleStatusChange}
              isResolving={isResolving}
            />
            {filteredRequests.length > 0 && (
              <div className="mt-6 flex justify-center items-center space-x-4">
                <button
                  onClick={handlePreviousPage}
                  disabled={page === 1}
                  className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 disabled:opacity-50 px-4 py-2 rounded-lg shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>
                <span className="px-4 py-2 bg-white text-gray-900 rounded-lg shadow-sm border border-gray-200">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={page === totalPages}
                  className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 disabled:opacity-50 px-4 py-2 rounded-lg shadow-sm"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminTrainerRequest;