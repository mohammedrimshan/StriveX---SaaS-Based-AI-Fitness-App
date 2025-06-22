"use client"

import { useState } from 'react';
import BackUpClientsDashboard, { BackupClient } from './Admin/BackUpClients';
import { useBackupClientsOverview } from '@/hooks/backuptrainer/useBackupClientsOverview';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, ArrowLeft, ArrowRight } from 'lucide-react';

const AdminBackupClientsList = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isPremium, setIsPremium] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");
  
  const { data, isLoading, isError, error } = useBackupClientsOverview({ page, limit });

const clients = data?.clients ?? [];
const totalPages = data?.totalPages ?? 0;


  const filteredClients = clients.filter((client: BackupClient) =>
    (`${client.firstName} ${client.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
     `${client.backupTrainer.firstName} ${client.backupTrainer.lastName}`.toLowerCase().includes(search.toLowerCase())) &&
    (isPremium === undefined || client.isPremium === (isPremium === 'true'))
  );

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="min-h-screen py-6 px-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto">
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
            <Select 
              onValueChange={(value) => setIsPremium(value === 'all' ? undefined : value)} 
              value={isPremium === undefined ? 'all' : isPremium}
            >
              <SelectTrigger className="w-full sm:w-48 border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <SelectValue placeholder="Filter by Premium Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                <SelectItem value="true">Premium Only</SelectItem>
                <SelectItem value="false">Non-Premium Only</SelectItem>
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
              <div key={i} className="h-32 bg-white rounded-xl shadow-md animate-pulse flex items-center px-6">
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
              Error: {error?.message || "Failed to fetch backup clients"}
            </p>
          </motion.div>
        )}

        {/* Clients Dashboard */}
        {!isLoading && !isError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <BackUpClientsDashboard clients={filteredClients} />
            {filteredClients.length > 0 && (
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

export default AdminBackupClientsList;