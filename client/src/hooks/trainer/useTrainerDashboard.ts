import { useQuery } from "@tanstack/react-query";
import {
  getTrainerDashboardStats,
  getUpcomingSessions,
  getWeeklySessionStats,
  getClientFeedback,
  getEarningsReport,
  getClientProgress,
  getSessionHistory
} from "@/services/trainer/trainerService";
import {
  ITrainerDashboardStats,
  IUpcomingSession,
  IWeeklySessionStats,
  IClientFeedback,
  IEarningsReport,
  IClientProgress,
  ISessionHistory
} from "@/types/TrainerDashboard";

export const useTrainerDashboardStats = (trainerId: string, year: number, month: number) => {
  return useQuery<ITrainerDashboardStats, Error>({
    queryKey: ["trainerDashboardStats", trainerId, year, month],
    queryFn: async () => {
      const response = await getTrainerDashboardStats(trainerId, year, month);
      return response;
    },
    enabled: !!trainerId && !!year && !!month,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpcomingSessions = (trainerId: string, limit: number = 5) => {
  return useQuery<IUpcomingSession[], Error>({
    queryKey: ["upcomingSessions", trainerId, limit],
    queryFn: async () => {
      const response = await getUpcomingSessions(trainerId, limit);
      return response;
    },
    enabled: !!trainerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useWeeklySessionStats = (trainerId: string, year: number, month: number) => {
  return useQuery<IWeeklySessionStats[], Error>({
    queryKey: ["weeklySessionStats", trainerId, year, month],
    queryFn: async () => {
      const response = await getWeeklySessionStats(trainerId, year, month);
      return response;
    },
    enabled: !!trainerId && !!year && !!month,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useClientFeedback = (trainerId: string, limit: number = 5) => {
  return useQuery<IClientFeedback[], Error>({
    queryKey: ["clientFeedback", trainerId, limit],
    queryFn: async () => {
      const response = await getClientFeedback(trainerId, limit);
      return response;
    },
    enabled: !!trainerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useEarningsReport = (trainerId: string, year: number, month: number) => {
  return useQuery<IEarningsReport, Error>({
    queryKey: ["earningsReport", trainerId, year, month],
    queryFn: async () => {
      const response = await getEarningsReport(trainerId, year, month);
      return response;
    },
    enabled: !!trainerId && !!year && !!month,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useClientProgress = (trainerId: string, limit: number = 3) => {
  return useQuery<IClientProgress[], Error>({
    queryKey: ["clientProgress", trainerId, limit],
    queryFn: async () => {
      const response = await getClientProgress(trainerId, limit);
      return response;
    },
    enabled: !!trainerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useSessionHistory = (
  trainerId: string,
  filters: { date?: string; clientId?: string; status?: string }
) => {
  return useQuery<ISessionHistory[], Error>({
    queryKey: ["sessionHistory", trainerId, filters],
    queryFn: async () => {
      const response = await getSessionHistory(trainerId, filters);
      return response;
    },
    enabled: !!trainerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};