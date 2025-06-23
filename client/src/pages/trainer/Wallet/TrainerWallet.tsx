import React, { useEffect, useState } from 'react';
import { Wallet, TrendingUp, Calendar, TrendingDown, DollarSign, BarChart3, Sparkles, Trophy } from 'lucide-react';
import { StatisticCard } from '@/components/wallet/StatisticCard';
import { FilterControls } from '@/components/wallet/FilterControls';
import { WalletTable } from '@/components/wallet/WalletTable';
import { WalletMobileCards } from '@/components/wallet/WalletMobileCards';
import { Pagination } from '@/components/wallet/Pagination';
import { useWalletBalanceData } from '@/components/wallet/useWalletData';
import { usePagination } from '@/components/wallet/usePagination';
import { exportToCSV, exportToPDF } from '../../../utils/exportUtils';
import { format, formatCurrency } from '../../../utils/dateUtils';
import AnimatedBackground from '@/components/Animation/AnimatedBackgorund';
import AnimatedTitle from '@/components/Animation/AnimatedTitle';

const TrainerWallet: React.FC = () => {
  const limit = 5;
  const [mounted, setMounted] = useState(false);
  
  const {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    status,
    setStatus,
    filteredData,
    statistics,
    clearFilters,
    isLoading,
    isError,
    error,
    total,
    totalPages,
  } = useWalletBalanceData(1, limit);

  const {
    currentPage,
    setCurrentPage,
    paginatedData,
    totalPages: paginationTotalPages,
    totalItems,
    resetPage,
  } = usePagination(filteredData, total, totalPages);

  useEffect(() => {
    setMounted(true);
    resetPage();
  }, [filteredData.length, status, resetPage]);

  const handleExportCSV = () => exportToCSV(filteredData);
  const handleExportPDF = () => exportToPDF(filteredData);

  if (!mounted || isLoading) {
    return (
      <AnimatedBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="text-lg font-medium text-gray-700">Loading your wallet...</span>
            </div>
          </div>
        </div>
      </AnimatedBackground>
    );
  }

  if (isError) {
    return (
      <AnimatedBackground>
        <div className="min-h-screen flex items-center justify-center ">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-md text-center">
            <div className="text-red-500 mb-4">
              <TrendingDown size={48} className="mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600">{error?.message}</p>
          </div>
        </div>
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground>
      <div className="min-h-screen p-4 lg:p-8 mt-8">
        <div className="max-w-7xl mx-auto">
          {/* Animated Header */}
          <div className="mb-12">
            <AnimatedTitle 
              title="Trainer Wallet" 
              subtitle="Track your earnings and commission from client subscriptions with real-time analytics"
            />
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatisticCard
              title="Total Earnings"
              value={formatCurrency(statistics.totalEarnings)}
              icon={Wallet}
              color="green"
            />
            <StatisticCard
              title="Total Transactions"
              value={statistics.totalTransactions}
              icon={TrendingUp}
              color="blue"
            />
            <StatisticCard
              title={`${format(new Date(), 'MMMM')} Earnings`}
              value={formatCurrency(statistics.currentMonthEarnings)}
              icon={Calendar}
              color="purple"
            />
            <StatisticCard
              title={`${format(new Date(), 'MMMM')} Transactions`}
              value={statistics.currentMonthTransactions}
              icon={TrendingDown}
              color="orange"
            />
          </div>

          {/* Filters and Export Controls */}
          <FilterControls
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            status={status}
            onStatusChange={setStatus}
            onClearFilters={clearFilters}
            onExportCSV={handleExportCSV}
            onExportPDF={handleExportPDF}
          />

          {/* Enhanced Wallet Table */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            {/* Enhanced Header with Icons and Gradient */}
            <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-8 overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 left-4">
                  <DollarSign size={120} className="text-white/20" />
                </div>
                <div className="absolute top-8 right-8">
                  <BarChart3 size={80} className="text-white/20" />
                </div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <Trophy size={60} className="text-white/20" />
                </div>
              </div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                      <Sparkles size={32} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl lg:text-3xl font-bold mb-2">
                        Earnings Overview
                      </h2>
                      <p className="text-white/80 text-sm lg:text-base">
                        Detailed breakdown of your financial performance
                      </p>
                    </div>
                  </div>
                  
                  {/* Stats Pills */}
                  <div className="hidden lg:flex space-x-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2">
                      <TrendingUp size={16} />
                      <span className="text-sm font-medium">
                        {statistics.totalTransactions} Transactions
                      </span>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2">
                      <Wallet size={16} />
                      <span className="text-sm font-medium">
                        {formatCurrency(statistics.totalEarnings)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mobile Stats */}
                <div className="lg:hidden mt-6 flex space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-2">
                    <TrendingUp size={14} />
                    <span className="text-xs font-medium">
                      {statistics.totalTransactions}
                    </span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-2">
                    <Wallet size={14} />
                    <span className="text-xs font-medium">
                      {formatCurrency(statistics.totalEarnings)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Animated Border */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-pink-400 to-blue-400 opacity-60"></div>
            </div>

            <WalletTable data={paginatedData} />
            <WalletMobileCards data={paginatedData} />

            <div className="bg-gray-50/50 backdrop-blur-sm border-t border-gray-200/50">
              <Pagination
                currentPage={currentPage}
                totalPages={paginationTotalPages}
                totalItems={totalItems}
                itemsPerPage={limit}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
};

export default TrainerWallet;