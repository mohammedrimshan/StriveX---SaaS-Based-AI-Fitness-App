// import { useQuery } from "@tanstack/react-query";
// import { getAllAdminWorkouts } from "@/services/admin/adminService";
// import { PaginatedResult, IWorkoutEntity } from "@/types/Workouts";

// export const useAllAdminWorkouts = (page: number = 1, limit: number = 10, filter: object = {}) => {
//   return useQuery<PaginatedResult<IWorkoutEntity>, Error>({
//     queryKey: ["allAdminWorkouts", page, limit, filter],
//     queryFn: () => getAllAdminWorkouts(page, limit, filter),
//     keepPreviousData: true,
//   });
// };