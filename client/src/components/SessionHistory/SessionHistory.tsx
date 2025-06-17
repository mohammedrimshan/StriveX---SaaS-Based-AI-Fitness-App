"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useSessionHistory } from "@/hooks/session/useSessionHistory";
import { UserRole } from "@/types/UserRole";
import { exportToCSV, exportToPDF } from "@/utils/sessionUtil";
import { SessionItem } from "@/types/Session";
import AnimatedBackground from "../Animation/AnimatedBackgorund";
import AnimatedTitle from "../Animation/AnimatedTitle";
import SearchControls from "./SearchControls";
import SessionTable from "./SessionTable";
import SessionCards from "./SessionCards";
import { Pagination } from "../common/Pagination/Pagination";
import _ from 'lodash';

interface SessionHistoryProps {
  role: UserRole;
}

const SessionHistory: React.FC<SessionHistoryProps> = ({ role }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch session history using the hook
  const { data, isLoading, isError } = useSessionHistory({ role, page, limit });

  // Map backend data to SessionItem type
  const items: SessionItem[] = useMemo(() => {
    if (!data?.data.items) return [];
    return data.data.items.map((item) => ({
      id: item.id,
      trainerId: item.trainerId,
      trainerName: item.trainerName, 
      clientId: item.clientId,
      clientName: item.clientName,
      date: item.date,
      startTime: item.startTime, 
      endTime: item.endTime,
      status: item.status,
      videoCallStatus: item.videoCallStatus === "ended" ? "Completed" : "not started",
      bookedAt: item.date, 
      createdAt: item.createdAt || new Date().toISOString(), 
      updatedAt: item.updatedAt || new Date().toISOString(),
    }));
  }, [data]);

  // Enhanced search function with multiple criteria
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    
    const searchLower = searchTerm.toLowerCase().trim();
    
    return items.filter((item) => {
      // Search in multiple fields
      const searchableFields = [
        item.trainerName,
        item.clientName,
        item.status,
        item.videoCallStatus,
        item.date,
        item.startTime,
        item.endTime,
        item.id
      ].map(field => field?.toString().toLowerCase() || '');
      
      // Check if search term matches any field
      return searchableFields.some(field => 
        field.includes(searchLower)
      );
    });
  }, [items, searchTerm]);

  // Debounced search handler
  const handleSearchChange = useCallback(
    _.debounce((term: string) => {
      setSearchTerm(term);
      // Reset to first page when searching
      if (term !== searchTerm) {
        setPage(1);
      }
    }, 100), // Small debounce since the SearchControls already debounces
    [searchTerm]
  );

  // Calculate pagination
  const total = data?.data.total || 0;
  const totalPages = Math.ceil(total / limit);


  // Export handlers - now with filtered data
  const handleExportCSV = useCallback(() => {
    exportToCSV(filteredItems, role);
  }, [filteredItems, role]);

  const handleExportPDF = useCallback(() => {
    exportToPDF(filteredItems, role);
  }, [filteredItems, role]);

  // Search statistics
  const searchStats = useMemo(() => ({
    total: filteredItems.length,
    isFiltered: searchTerm.trim().length > 0
  }), [filteredItems, searchTerm]);

  return (
    <AnimatedBackground>
      <div className="min-h-screen relative overflow-hidden mt-16">
        <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-6 lg:p-8 relative z-10">
          <AnimatedTitle 
            title="Session History"
            subtitle="Track your fitness journey with detailed session records"
            className="mb-12"
          />

          <SearchControls
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onExportCSV={handleExportCSV}
            onExportPDF={handleExportPDF}
            totalResults={searchStats.total}
            isLoading={isLoading}
          />

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col justify-center items-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-600 animate-pulse">Loading your sessions...</p>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center shadow-lg">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <p className="text-red-600 font-medium text-lg mb-2">Failed to load session history</p>
              <p className="text-red-500 text-sm">Please check your connection and try again</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Content - only show if not loading and no error */}
          {!isLoading && !isError && (
            <>
              {/* Desktop Table View - Hidden on mobile */}
              <div className="hidden lg:block">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
                  <SessionTable
                    filteredItems={filteredItems}
                    searchTerm={searchTerm}
                    role={role}
                  />
                </div>
                
                {/* Pagination for Desktop Table */}
                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                      maxVisiblePages={5}
                      className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-gray-200/50"
                    />
                  </div>
                )}
              </div>

              {/* Mobile Card View - Hidden on desktop */}
              <div className="block lg:hidden">
                <SessionCards
                  filteredItems={filteredItems}
                  searchTerm={searchTerm}
                  role={role}
                />
                
                {/* Pagination for Mobile Cards */}
                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                      maxVisiblePages={3}
                      className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-gray-200/50"
                    />
                  </div>
                )}
              </div>

              {/* Empty State */}
              {filteredItems.length === 0 && !isLoading && (
                <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50">
                  <div className="text-gray-400 text-8xl mb-6">
                    {searchStats.isFiltered ? "🔍" : "📋"}
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-3">
                    {searchStats.isFiltered ? "No matches found" : "No sessions found"}
                  </h3>
                  <p className="text-gray-500 text-lg mb-6 max-w-md mx-auto">
                    {searchStats.isFiltered 
                      ? `No sessions match "${searchTerm}". Try different search terms or check your spelling.`
                      : "Your session history will appear here once you start booking sessions"
                    }
                  </p>
                  {searchStats.isFiltered && (
                    <button
                      onClick={() => handleSearchChange("")}
                      className="px-6 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-all duration-300 transform hover:scale-105 font-medium"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              )}

              {/* Search Results Summary */}
              {searchStats.isFiltered && filteredItems.length > 0 && (
                <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 text-center">
                  <p className="text-cyan-800">
                    Found <span className="font-semibold">{searchStats.total}</span> session
                    {searchStats.total !== 1 ? 's' : ''} matching 
                    <span className="font-semibold"> "{searchTerm}"</span>
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AnimatedBackground>
  );
};

export default SessionHistory;