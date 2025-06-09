import { useQuery, useMutation } from "@tanstack/react-query";
import { adminAxiosInstance } from "@/api/admin.axios";
import {
  IDashboardStats,
  ITopTrainer,
  IPopularWorkout,
  IUserAndSessionData,

} from "@/types/AdminDashboard";

interface FetchDashboardStatsParams {
  year?: number;
}

interface FetchTopTrainersParams {
  limit?: number;
}

interface FetchPopularWorkoutsParams {
  limit?: number;
}

interface FetchUserAndSessionDataParams {
  year?: number;
  type?: "daily" | "weekly";
}

interface FetchReportParams {
  year?: number;
}

const fetchDashboardStats = async ({
  year = new Date().getFullYear(),
}: FetchDashboardStatsParams): Promise<IDashboardStats> => {
  const response = await adminAxiosInstance.get("/admin/stats", {
    params: { year },
  });
  return response.data;
};

const fetchTopTrainers = async ({
  limit = 5,
}: FetchTopTrainersParams): Promise<ITopTrainer[]> => {
  const response = await adminAxiosInstance.get("/admin/top-trainers", {
    params: { limit },
  });
  return response.data;
};

const fetchPopularWorkouts = async ({
  limit = 5,
}: FetchPopularWorkoutsParams): Promise<IPopularWorkout[]> => {
  const response = await adminAxiosInstance.get("/admin/popular-workouts", {
    params: { limit },
  });
  return response.data;
};

const fetchUserAndSessionData = async ({
  year = new Date().getFullYear(),
  type = "daily",
}: FetchUserAndSessionDataParams): Promise<IUserAndSessionData> => {
  const response = await adminAxiosInstance.get("/admin/user-and-session-data", {
    params: { year, type },
  });
  return response.data;
};

const downloadRevenueReport = async ({
  year = new Date().getFullYear(),
}: FetchReportParams): Promise<Blob> => {
  const response = await adminAxiosInstance.get("/admin/revenue-report", {
    params: { year },
    responseType: "blob",
  });
  return response.data;
};

const downloadSessionReport = async ({
  year = new Date().getFullYear(),
}: FetchReportParams): Promise<Blob> => {
  const response = await adminAxiosInstance.get("/admin/session-report", {
    params: { year },
    responseType: "blob",
  });
  return response.data;
};

export const useAdminDashboard = () => {
 

  const useDashboardStats = ({ year }: FetchDashboardStatsParams = {}) =>
    useQuery({
      queryKey: ["dashboardStats", year],
      queryFn: () => fetchDashboardStats({ year }),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });

  const useTopTrainers = ({ limit }: FetchTopTrainersParams = {}) =>
    useQuery({
      queryKey: ["topTrainers", limit],
      queryFn: () => fetchTopTrainers({ limit }),
      staleTime: 5 * 60 * 1000,
    });

  const usePopularWorkouts = ({ limit }: FetchPopularWorkoutsParams = {}) =>
    useQuery({
      queryKey: ["popularWorkouts", limit],
      queryFn: () => fetchPopularWorkouts({ limit }),
      staleTime: 5 * 60 * 1000,
    });

  const useUserAndSessionData = ({ year, type }: FetchUserAndSessionDataParams = {}) =>
    useQuery({
      queryKey: ["userAndSessionData", year, type],
      queryFn: () => fetchUserAndSessionData({ year, type }),
      staleTime: 5 * 60 * 1000,
    });

  const useDownloadRevenueReport = () =>
    useMutation({
      mutationFn: downloadRevenueReport,
      onSuccess: (data, { year }) => {
        const url = window.URL.createObjectURL(data);
        const link = document.createElement("a");
        link.href = url;
        link.download = `revenue_report_${year}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      onError: () => {
        throw new Error("Failed to download revenue report");
      },
    });

  const useDownloadSessionReport = () =>
    useMutation({
      mutationFn: downloadSessionReport,
      onSuccess: (data, { year }) => {
        const url = window.URL.createObjectURL(data);
        const link = document.createElement("a");
        link.href = url;
        link.download = `session_report_${year}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      onError: () => {
        throw new Error("Failed to download session report");
      },
    });

  return {
    useDashboardStats,
    useTopTrainers,
    usePopularWorkouts,
    useUserAndSessionData,
    useDownloadRevenueReport,
    useDownloadSessionReport,
  };
};