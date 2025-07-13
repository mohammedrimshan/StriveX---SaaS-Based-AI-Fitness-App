import { axiosInstance } from "@/api/private.axios";
import { UserRole } from "@/types/UserRole";

export interface SessionHistoryResponse {
  success: boolean;
  data: {
    items: {
      id: string;
      trainerId: string;
      trainerName: string;
      clientId: string;
      clientName: string;
      date: string;
      startTime: string;
      endTime: string;
      status: string;
      videoCallStatus: string;
      bookedAt: string;
      createdAt: string;
      updatedAt: string;
    }[];
    total: number;
  };
}

const getPrefix = (role: UserRole) => {
  if (role === "admin") return "/admin";
  if (role === "trainer") return "/trainer";
  return "/client";
};

export const getSessionHistory = async (
  role: UserRole,
  page: number = 1,
  limit: number = 10
): Promise<SessionHistoryResponse> => {
  try {
    const prefix = getPrefix(role);
    const response = await axiosInstance.get<SessionHistoryResponse>(
      `${prefix}/session-history`,
      { params: { skip: (page - 1) * limit, limit } }
    );
    console.log("Session history:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Get session history error:", error.response?.data);
    throw new Error(
      error.response?.data?.message || "Failed to fetch session history"
    );
  }
};
