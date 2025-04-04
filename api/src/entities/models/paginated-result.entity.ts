export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    totalPages: number;
  }