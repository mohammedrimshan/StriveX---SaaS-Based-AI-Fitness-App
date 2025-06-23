import { trainerAxiosInstance } from "@/api/trainer.axios";
import { IClient, ITrainer } from "@/types/User";
import { CategoryResponse } from "@/hooks/admin/useAllCategory";
import { IAxiosResponse } from "@/types/Response";
import { UpdatePasswordData } from "@/hooks/trainer/useTrainerPasswordChange";
import { SlotsResponse, CreateSlotData, CancelSlotData, CancelSlotResponse } from "@/types/Slot";
import { WalletHistoryResponse } from "@/types/wallet";
import {
  ITrainerDashboardStats,
  IUpcomingSession,
  IWeeklySessionStats,
  IClientFeedback,
  IEarningsReport,
  IClientProgress,
  ISessionHistory,
} from "@/types/TrainerDashboard";
import { Review } from "@/types/trainer";


interface GetTrainerSlotsParams {
  trainerId: string;
  date?: string;
  page?: number;
  limit?: number;
}

export interface TrainerClient {
  id: string;
  client: string;
  preferences: {
    workoutType?: string;
    fitnessGoal?: string;
    skillLevel?: string;
    skillsToGain: string[];
  };
  status: string;
}

// Interface for paginated clients response
export interface TrainerClientsPaginatedResponse {
  success: boolean;
  message: string;
  clients: IClient[];
  totalPages: number;
  currentPage: number;
  totalClients: number;
}

// Interface for pending client requests
export interface PendingClientRequest {
  id?: string;
  clientId: string;
  firstName: string;
  lastName: string;
  email: string;
  selectStatus: string;
  preferences?: {
    workoutType?: string;
    fitnessGoal?: string;
    skillLevel?: string;
    skillsToGain: string[];
  };
}

// Interface for paginated pending requests response
export interface PendingClientRequestsResponse {
  success: boolean;
  message: string;
  requests: PendingClientRequest[];
  totalPages: number;
  currentPage: number;
  totalRequests: number;
}

// Interface for accept/reject request response
export interface ClientRequestActionResponse {
  success: boolean;
  message: string;
  client: PendingClientRequest;
}

// Get trainer profile information
export const getTrainerProfile = async (): Promise<any> => {
  const response = await trainerAxiosInstance.get("/trainer/profile");
  return response.data;
};

// Update trainer profile
export const updateTrainerProfile = async (
  trainerId: string,
  profileData: Partial<ITrainer>
): Promise<{ success: boolean; message: string; trainer: ITrainer }> => {
  const response = await trainerAxiosInstance.put(
    `/trainer/${trainerId}/profile`,
    profileData
  );
  console.log("Update trainer profile response:", response.data);
  return response.data;
};

export const updateTrainerPassword = async ({
  currentPassword,
  newPassword,
}: UpdatePasswordData) => {
  const response = await trainerAxiosInstance.put<IAxiosResponse>(
    "/trainer/update-password",
    {
      currentPassword,
      newPassword,
    }
  );
  console.log(response.data);
  return response.data;
};

// Upload trainer certificate or credential
export const uploadTrainerCredential = async (
  credentialData: FormData
): Promise<any> => {
  const response = await trainerAxiosInstance.post(
    "/trainer/credentials",
    credentialData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const getAllCategoriesForTrainer = async () => {
  const response = await trainerAxiosInstance.get<CategoryResponse>(
    "/trainer/getallcategory"
  );
  return response.data;
};

export const getTrainerClients = async (
  page: number = 1,
  limit: number = 10
): Promise<TrainerClientsPaginatedResponse> => {
  const response =
    await trainerAxiosInstance.get<TrainerClientsPaginatedResponse>(
      "/trainer/clients",
      {
        params: { page, limit },
      }
    );
  return response.data;
};

// Get pending client requests
export const getPendingClientRequests = async (
  page: number = 1,
  limit: number = 10
): Promise<PendingClientRequestsResponse> => {
  const response =
    await trainerAxiosInstance.get<PendingClientRequestsResponse>(
      "/trainer/pending-requests",
      {
        params: { page, limit },
      }
    );
  return response.data;
};

// Accept or reject client request
export const acceptRejectClientRequest = async (
  clientId: string, // Ensure this is the clientId from PendingClientRequest
  action: "accept" | "reject",
  rejectionReason?: string
): Promise<ClientRequestActionResponse> => {
  const payload = {
    clientId, // This should now be the custom clientId (e.g., strivex-client-...)
    action,
    rejectionReason: action === "reject" ? rejectionReason : undefined,
  };

  console.log("Sending accept/reject request with payload:", payload);
  const response = await trainerAxiosInstance.post<ClientRequestActionResponse>(
    "/trainer/client-request",
    payload
  );

  console.log("Accept/reject response:", response.data); // Add logging to debug
  return response.data;
};

export const createSlot = async (
  data: CreateSlotData
): Promise<SlotsResponse> => {
  try {
    const response = await trainerAxiosInstance.post<SlotsResponse>(
      "/trainer/create",
      data
    );
    console.log("Slot created:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Create slot error:", error.response?.data);
    throw new Error(error.response?.data?.message || "Failed to create slot");
  }
};

// Get trainer's own slots
export const getTrainerOwnSlots = async (): Promise<SlotsResponse> => {
  try {
    const response = await trainerAxiosInstance.get<SlotsResponse>(
      "/trainer/trainerslots"
    );
    console.log("Trainer's own slots:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Get trainer slots error:", error.response?.data);
    throw new Error(
      error.response?.data?.message || "Failed to fetch trainer slots"
    );
  }
};

export const getTrainerBookedAndCancelledSlots = async ({
  trainerId,
  date,
  page,
  limit,
}: GetTrainerSlotsParams): Promise<SlotsResponse> => {
  try {
    const response = await trainerAxiosInstance.get<SlotsResponse>(
      "/trainer/slotbooks",
      {
        params: { trainerId, date, page, limit },
      }
    );
    console.log("Trainer's booked and cancelled slots:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Get trainer slots error:", error.response?.data);
    throw new Error(
      error.response?.data?.message || "Failed to fetch trainer slots"
    );
  }
};

// Get trainer wallet history
export const getTrainerWalletHistory = async (
  page: number = 1,
  limit: number = 10,
  status?: string
): Promise<WalletHistoryResponse> => {
  try {
    const response = await trainerAxiosInstance.get<WalletHistoryResponse>(
      "/trainer/wallet-history",
      {
        params: { page, limit, status },
      }
    );
    console.log("Wallet history response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Get wallet history error:", error.response?.data);
    throw new Error(
      error.response?.data?.message || "Failed to fetch wallet history"
    );
  }


};const logResponse = (endpoint: string, response: any) => {
  console.log(`[API Response] ${endpoint}:`, {
    status: response?.status,
    data: response?.data,
    headers: response?.headers
  });
};

const logError = (endpoint: string, error: any) => {
  console.error(`[API Error] ${endpoint}:`, {
    message: error.message,
    response: error.response?.data,
    status: error.response?.status,
    headers: error.response?.headers
  });
};

export const getTrainerDashboardStats = async (
  trainerId: string,
  year: number,
  month: number
): Promise<ITrainerDashboardStats> => {
  try {
    const response = await trainerAxiosInstance.get(
      `/trainer/${trainerId}/stats`,
      { params: { year, month } }
    );
    logResponse(`/trainer/${trainerId}/stats`, response);
    return response.data; // Return response.data directly
  } catch (error: any) {
    logError(`/trainer/${trainerId}/stats`, error);
    throw new Error(error.response?.data?.error || "Failed to fetch dashboard stats");
  }
};

export const getUpcomingSessions = async (
  trainerId: string,
  limit: number = 5
): Promise<IUpcomingSession[]> => {
  try {
    const response = await trainerAxiosInstance.get(
      `/trainer/${trainerId}/upcoming-sessions`,
      { params: { limit } }
    );
    logResponse(`/trainer/${trainerId}/upcoming-sessions`, response);
    return response.data || []; // Return response.data or empty array
  } catch (error: any) {
    logError(`/trainer/${trainerId}/upcoming-sessions`, error);
    throw new Error(error.response?.data?.error || "Failed to fetch upcoming sessions");
  }
};

export const getWeeklySessionStats = async (
  trainerId: string,
  year: number,
  month: number
): Promise<IWeeklySessionStats[]> => {
  try {
    const response = await trainerAxiosInstance.get(
      `/trainer/${trainerId}/weekly-stats`,
      { params: { year, month } }
    );
    logResponse(`/trainer/${trainerId}/weekly-stats`, response);
    return response.data || []; // Return response.data or empty array
  } catch (error: any) {
    logError(`/trainer/${trainerId}/weekly-stats`, error);
    throw new Error(error.response?.data?.error || "Failed to fetch weekly session stats");
  }
};

export const getClientFeedback = async (
  trainerId: string,
  limit: number = 5
): Promise<IClientFeedback[]> => {
  try {
    const response = await trainerAxiosInstance.get(
      `/trainer/${trainerId}/feedback`,
      { params: { limit } }
    );
    logResponse(`/trainer/${trainerId}/feedback`, response);
    return response.data || []; // Return response.data or empty array
  } catch (error: any) {
    logError(`/trainer/${trainerId}/feedback`, error);
    throw new Error(error.response?.data?.error || "Failed to fetch client feedback");
  }
};

export const getEarningsReport = async (
  trainerId: string,
  year: number,
  month: number
): Promise<IEarningsReport> => {
  try {
    const response = await trainerAxiosInstance.get(
      `/trainer/${trainerId}/earnings`,
      { params: { year, month } }
    );
    logResponse(`/trainer/${trainerId}/earnings`, response);
    return response.data; // Return response.data directly
  } catch (error: any) {
    logError(`/trainer/${trainerId}/earnings`, error);
    throw new Error(error.response?.data?.error || "Failed to fetch earnings report");
  }
};

export const getClientProgress = async (
  trainerId: string,
  limit: number = 3
): Promise<IClientProgress[]> => {
  try {
    const response = await trainerAxiosInstance.get(
      `/trainer/${trainerId}/client-progress`,
      { params: { limit } }
    );
    logResponse(`/trainer/${trainerId}/client-progress`, response);
    return response.data || []; // Return response.data or empty array
  } catch (error: any) {
    logError(`/trainer/${trainerId}/client-progress`, error);
    throw new Error(error.response?.data?.error || "Failed to fetch client progress");
  }
};

export const getSessionHistory = async (
  trainerId: string,
  filters: { date?: string; clientId?: string; status?: string }
): Promise<ISessionHistory[]> => {
  try {
    const response = await trainerAxiosInstance.get(
      `/trainer/${trainerId}/session-history`,
      { params: filters }
    );
    logResponse(`/trainer/${trainerId}/session-history`, response);
    return response.data || []; // Return response.data or empty array
  } catch (error: any) {
    logError(`/trainer/${trainerId}/session-history`, error);
    throw new Error(error.response?.data?.error || "Failed to fetch session history");
  }
};

export const fetchTrainerReviews = async (
  trainerId: string,
  skip: number = 0,
  limit: number = 10
): Promise<{ items: Review[]; total: number }> => {
  try {
    const response = await trainerAxiosInstance.get<{ success: boolean; data: { items: Review[]; total: number } }>(
      `/trainer/reviews/${trainerId}`,
      { params: { skip, limit } }
    );
    if (!response.data.success || !response.data.data) {
      throw new Error("Failed to fetch reviews");
    }
    return response.data.data;
  } catch (error) {
    console.error("fetchTrainerReviews Error:", error);
    throw error;
  }
};


export const cancelTrainerSlot = async (
  payload: CancelSlotData
): Promise<CancelSlotResponse> => {
  const response = await trainerAxiosInstance.post("/trainer/cancel-slot", payload);
  return response.data;
};