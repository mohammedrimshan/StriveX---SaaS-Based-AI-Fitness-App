
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addWorkout,
  updateWorkout,
  deleteWorkout,
  getAllWorkouts,
  toggleWorkoutStatus,
  WorkoutType,
  WorkoutsPaginatedResponse,
} from "@/services/admin/adminService";

interface UseWorkoutsProps {
  page?: number;
  limit?: number;
  filter?: any;
}

// Custom hook for managing workouts
export const useWorkouts = ({ page = 1, limit = 10, filter = {} }: UseWorkoutsProps = {}) => {
  const queryClient = useQueryClient();

  // Fetch all workouts
  const { data: workoutsData, isLoading: isWorkoutsLoading } = useQuery<WorkoutsPaginatedResponse>({
    queryKey: ["workouts", page, limit, filter],
    queryFn: () => getAllWorkouts({ page, limit, filter }),
  });

  // Add a new workout
  const addWorkoutMutation = useMutation({
    mutationFn: ({ workoutData, image }: { workoutData: WorkoutType; image?: string }) =>
      addWorkout(workoutData, image),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });

  // Update an existing workout
  const updateWorkoutMutation = useMutation({
mutationFn: ({ workoutId, workoutData, image }: { workoutId: string; workoutData: Partial<WorkoutType>; image?: string }) =>
  updateWorkout(workoutId, workoutData, { image }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });

  // Delete a workout
  const deleteWorkoutMutation = useMutation({
    mutationFn: (workoutId: string) => deleteWorkout(workoutId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });

  // Toggle workout status
  const toggleWorkoutStatusMutation = useMutation({
    mutationFn: (workoutId: string) => toggleWorkoutStatus(workoutId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });

  return {
    workouts: workoutsData?.data.data || [],
    pagination: {
      total: workoutsData?.data.total || 0,
      page: workoutsData?.data.page || 1,
      limit: workoutsData?.data.limit || 10,
      hasNextPage: workoutsData?.data.hasNextPage || false,
      hasPreviousPage: workoutsData?.data.hasPreviousPage || false,
      totalPages: workoutsData?.data.totalPages || 0,
    },
    isWorkoutsLoading,
    addWorkout: addWorkoutMutation.mutateAsync,
    updateWorkout: updateWorkoutMutation.mutateAsync,
    deleteWorkout: deleteWorkoutMutation.mutateAsync,
    toggleWorkoutStatus: toggleWorkoutStatusMutation.mutateAsync,
    isAdding: addWorkoutMutation.isPending,
    isUpdating: updateWorkoutMutation.isPending,
    isDeleting: deleteWorkoutMutation.isPending,
    isToggling: toggleWorkoutStatusMutation.isPending,
  };
};