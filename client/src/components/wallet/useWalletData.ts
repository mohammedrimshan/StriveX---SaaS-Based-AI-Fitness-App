import { useState, useMemo } from 'react';
import { WalletHistoryItem, WalletRecord, WalletStatistics } from '../../types/wallet';
import { parseISO, isWithinInterval, startOfMonth, endOfMonth } from '../../utils/dateUtils';
import { useTrainerWalletHistory } from '../../hooks/slot/useTrainerWalletHistory';

interface UseWalletDataReturn {
  startDate: Date | undefined;
  endDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  setEndDate: (date: Date | undefined) => void;
  status: string | undefined;
  setStatus: (status: string | undefined) => void;
  filteredData: WalletRecord[];
  statistics: WalletStatistics;
  clearFilters: () => void;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  total: number;
  totalPages: number;
}

export const useWalletBalanceData = (page: number, limit: number): UseWalletDataReturn => {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [status, setStatus] = useState<string | undefined>();

  const { data, isLoading, isError, error } = useTrainerWalletHistory({ page, limit, status });

  // Map the API wallet history items to WalletRecord type
  const walletData: WalletRecord[] = data?.data.items
    ? mapHistoryToRecord(data.data.items)
    : [];

  const total = data?.data.total || 0;
  const totalPages = data?.data.totalPages || 1;

  const filteredData = useMemo(() => {
    if (!startDate && !endDate) return walletData;

    return walletData.filter((record) => {
      const recordDate = parseISO(record.completedAt);

      if (startDate && endDate) {
        return isWithinInterval(recordDate, { start: startDate, end: endDate });
      } else if (startDate) {
        return recordDate >= startDate;
      } else if (endDate) {
        return recordDate <= endDate;
      }

      return true;
    });
  }, [walletData, startDate, endDate]);

  const currentMonthData = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    return filteredData.filter((record) => {
      const recordDate = parseISO(record.completedAt);
      return isWithinInterval(recordDate, { start: monthStart, end: monthEnd });
    });
  }, [filteredData]);

  const statistics: WalletStatistics = useMemo(() => {
    const totalEarnings = filteredData.reduce((sum, record) => sum + record.trainerAmount, 0);
    const totalTransactions = filteredData.length;
    const currentMonthEarnings = currentMonthData.reduce((sum, record) => sum + record.trainerAmount, 0);
    const currentMonthTransactions = currentMonthData.length;

    return {
      totalEarnings,
      totalTransactions,
      currentMonthEarnings,
      currentMonthTransactions,
    };
  }, [filteredData, currentMonthData]);

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setStatus(undefined);
  };

  return {
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
  };
};


export function mapHistoryToRecord(historyItems: WalletHistoryItem[]): WalletRecord[] {
  return historyItems.map(item => ({
    id: item.id,
    clientName: item.clientName,
    planTitle: item.planTitle,
    amount: item.amount,
    trainerAmount: item.trainerAmount,
    adminShare: item.adminShare,    
    completedAt: item.completedAt,     
    status: item.status,
  }));
}
