import { HTTP_STATUS, ERROR_MESSAGES } from "@/shared/constants";

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export function calculatePagination({ page, limit }: PaginationParams): {
  skip: number;
  limit: number;
  page: number;
} {
  const validPage = Math.max(1, page);
  const validLimit = Math.max(1, limit);
  if (isNaN(validPage) || isNaN(validLimit)) {
    throw new Error(ERROR_MESSAGES.VALIDATION_ERROR);
  }
  return {
    skip: (validPage - 1) * validLimit,
    limit: validLimit,
    page: validPage,
  };
}