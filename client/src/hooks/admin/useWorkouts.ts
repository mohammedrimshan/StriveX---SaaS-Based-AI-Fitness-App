import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addExercise,
  updateExercise,
  deleteExercise,
} from "@/services/admin/adminService";
import {  Exercise } from "@/types/Workouts";

export const useWorkouts = () => {
  const queryClient = useQueryClient();

  const addExerciseMutation = useMutation({
    mutationFn: ({
      workoutId,
      exerciseData,
    }: {
      workoutId: string;
      exerciseData: Exercise;
    }) => addExercise(workoutId, exerciseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      queryClient.invalidateQueries({ queryKey: ["allWorkouts"] });
    },
    onError: (error: Error) => {
      console.error("Add exercise error:", error.message);
    },
  });

  const updateExerciseMutation = useMutation({
    mutationFn: ({
      workoutId,
      exerciseId,
      exerciseData,
    }: {
      workoutId: string;
      exerciseId: string;
      exerciseData: Partial<Exercise>;
    }) => updateExercise(workoutId, exerciseId, exerciseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      queryClient.invalidateQueries({ queryKey: ["allWorkouts"] });
    },
    onError: (error: Error) => {
      console.error("Update exercise error:", error.message);
    },
  });

  const deleteExerciseMutation = useMutation({
    mutationFn: ({ workoutId, exerciseId }: { workoutId: string; exerciseId: string }) =>
      deleteExercise(workoutId, exerciseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      queryClient.invalidateQueries({ queryKey: ["allWorkouts"] });
    },
    onError: (error: Error) => {
      console.error("Delete exercise error:", error.message);
    },
  });

  return {
    addExercise: addExerciseMutation.mutateAsync,
    isAddingExercise: addExerciseMutation.isPending,
    updateExercise: updateExerciseMutation.mutateAsync,
    isUpdatingExercise: updateExerciseMutation.isPending,
    deleteExercise: deleteExerciseMutation.mutateAsync,
    isDeletingExercise: deleteExerciseMutation.isPending,
  };
};