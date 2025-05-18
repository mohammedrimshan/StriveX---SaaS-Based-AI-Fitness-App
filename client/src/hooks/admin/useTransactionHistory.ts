import { useState, useEffect } from "react";
import { getTransactionHistory } from "@/services/admin/adminService";
import { TransactionData, FetchTransactionsParams, TransactionResponse } from "@/types/transaction";

interface TransactionHookResult {
  transactions: TransactionData[];
  totalPages: number;
  currentPage: number;
  totalTransactions: number;
  loading: boolean;
  updatingData: boolean; // New state for filter/pagination updates
  error: string | null;
  fetchTransactions: (params: FetchTransactionsParams) => Promise<void>;
}

export const useTransactionHistory = (initialParams: FetchTransactionsParams = { page: 1, limit: 10, status: "" }): TransactionHookResult => {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(initialParams.page || 1);
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true); // Only true on initial load
  const [updatingData, setUpdatingData] = useState<boolean>(false); // For updates, searches, filters
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);

  const fetchTransactions = async (params: FetchTransactionsParams) => {
    // Set loading state based on whether this is initial load or an update
    if (isInitialLoad) {
      setLoading(true);
    } else {
      setUpdatingData(true);
    }
    
    setError(null);
    
    try {
      console.log("Fetching transactions with params:", params);
      const response: TransactionResponse = await getTransactionHistory(params);
      console.log("API response:", response);
      setTransactions(response.transactions);
      setTotalPages(response.totalPages);
      setCurrentPage(params.page || 1);
      setTotalTransactions(response.totalTransactions);
    } catch (err: any) {
      setError(err.message || "Failed to fetch transactions");
    } finally {
      setLoading(false);
      setUpdatingData(false);
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  };

  useEffect(() => {
    fetchTransactions(initialParams);
  }, [initialParams.page, initialParams.limit]); // Only re-fetch on page/limit changes
  
  // Handle search and status filters separately to prevent unnecessary reloads
  useEffect(() => {
    if (!isInitialLoad) {
      const timer = setTimeout(() => {
        fetchTransactions(initialParams);
      }, 100); // Small delay to batch frequent changes
      return () => clearTimeout(timer);
    }
  }, [initialParams.search, initialParams.status]);

  return {
    transactions,
    totalPages,
    currentPage,
    totalTransactions,
    loading,
    updatingData,
    error,
    fetchTransactions,
  };
};