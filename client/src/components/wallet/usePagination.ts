
import { useState } from 'react';
import { WalletRecord } from '../../types/wallet';

interface UsePaginationReturn {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  paginatedData: WalletRecord[];
  totalPages: number;
  totalItems: number;
  resetPage: () => void;
}

export const usePagination = (data: WalletRecord[], totalItems: number, totalPages: number, ): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState(1);

  // Use server-provided data directly
  const paginatedData = data;
  
  const resetPage = () => setCurrentPage(1);

  return {
    currentPage,
    setCurrentPage,
    paginatedData,
    totalPages,
    totalItems,
    resetPage,
  };
};
