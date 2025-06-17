import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Review, ReviewInput, UpdateReviewInput } from "@/types/trainer";
import { submitReview, fetchTrainerReviews, updateReview } from "@/services/client/clientService";

export const useSubmitReview = () => {
  const queryClient = useQueryClient();
  return useMutation<Review, Error, ReviewInput>({
    mutationFn: submitReview,
    onSuccess: ( variables) => {
      queryClient.invalidateQueries({ queryKey: ["trainerProfile", variables.trainerId] });
      queryClient.invalidateQueries({ queryKey: ["trainerReviews", variables.trainerId] });
    },
    onError: (err: Error) => {
      console.error("useSubmitReview Error:", err.message);
    },
  });
};

interface UseFetchTrainerReviewsOptions {
  enabled?: boolean;
}

export const useFetchTrainerReviews = (
  trainerId: string | undefined,
  skip: number = 0,
  limit: number = 10,
  options?: UseFetchTrainerReviewsOptions
) => {
  return useQuery<
    { items: Review[]; total: number },
    Error,
    { items: Review[]; total: number },
    [string, string | undefined, number, number]
  >({
    queryKey: ["trainerReviews", trainerId, skip, limit],
    queryFn: async () => {
      if (!trainerId) throw new Error("Trainer ID is required");
      return fetchTrainerReviews(trainerId, skip, limit);
    },
    enabled: !!trainerId && options?.enabled !== false, // use dynamic flag
    staleTime: 5 * 60 * 1000,
  });
};


export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  return useMutation<Review, Error, UpdateReviewInput>({
    mutationFn: updateReview,
    onSuccess: ( variables) => {
      queryClient.invalidateQueries({ queryKey: ["trainerProfile", variables.trainerId] });
      queryClient.invalidateQueries({ queryKey: ["trainerReviews", variables.trainerId] });
    },
    onError: (err: Error) => {
      console.error("useUpdateReview Error:", err.message);
    },
  });
};
