// client\src\hooks\client\useFetchAllTrainers.ts
import { useQuery } from "@tanstack/react-query";
import { getAllTrainers } from "@/services/client/clientService";
import { PaginatedTrainersResponse } from "@/types/Response";

interface UseFetchAllTrainersOptions {
  page?: number;
  limit?: number;
  search?: string;
  enabled?: boolean;
}

export const useFetchAllTrainers = ({
  page = 1,
  limit = 5,
  search = "",
  enabled = true,
}: UseFetchAllTrainersOptions = {}) => {
  return useQuery<PaginatedTrainersResponse, Error>({
    queryKey: ["trainers", page, limit, search],
    queryFn: async (): Promise<PaginatedTrainersResponse> => {
      try {
        const data = await getAllTrainers(page, limit, search);
        console.log("Raw API response:", data);

        // Handle case where data is undefined or invalid
        if (!data || !data.trainers) {
          console.warn("No trainers data received from API");
          return {
            trainers: [],
            totalPages: 0,
            currentPage: page,
            totalTrainers: 0,
            success: false,
            message: "No trainers found",
          };
        }

        return data;
      } catch (error) {
        console.error("Error in getAllTrainers:", error);
        throw error; 
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,   
    placeholderData: (previousData) => previousData, 
  });
};