import { trainerAxiosInstance } from "@/api/trainer.axios";
import { IClient, ITrainer } from "@/types/User";
import { CategoryResponse } from "../admin/adminService";
import { IAxiosResponse } from "@/types/Response";
import { UpdatePasswordData } from "@/hooks/trainer/useTrainerPasswordChange";
import { SlotsResponse,CreateSlotData } from "@/types/Slot";


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
  const response = await trainerAxiosInstance.get('/trainer/profile');
  return response.data;
};

// Update trainer profile
export const updateTrainerProfile = async (
  trainerId: string,
  profileData: Partial<ITrainer>
): Promise<{ success: boolean; message: string; trainer: ITrainer }> => {
  const response = await trainerAxiosInstance.put(`/trainer/${trainerId}/profile`, profileData);
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
  console.log(response.data)
  return response.data;
};

// Upload trainer certificate or credential
export const uploadTrainerCredential = async (credentialData: FormData): Promise<any> => {
  const response = await trainerAxiosInstance.post('/trainer/credentials', credentialData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
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
  const response = await trainerAxiosInstance.get<TrainerClientsPaginatedResponse>(
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
  const response = await trainerAxiosInstance.get<PendingClientRequestsResponse>(
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
    rejectionReason: action === "reject" ? rejectionReason : undefined
  };

  console.log("Sending accept/reject request with payload:", payload);
  const response = await trainerAxiosInstance.post<ClientRequestActionResponse>(
    "/trainer/client-request", 
    payload
  );
  
  console.log("Accept/reject response:", response.data); // Add logging to debug
  return response.data;
};

export const createSlot = async (data: CreateSlotData): Promise<SlotsResponse> => {
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
    throw new Error(error.response?.data?.message || "Failed to fetch trainer slots");
  }
};

export const getTrainerBookedAndCancelledSlots = async (
  trainerId: string,
  date?: string,
  page: number = 1,
  limit: number = 20
): Promise<SlotsResponse> => {
  try {
    const response = await trainerAxiosInstance.get<SlotsResponse>(
      "/trainer/slotbooks",
      {
        params: { trainerId },
      }
    );
    console.log("Trainer's booked and cancelled slots:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Get trainer slots error:", error.response?.data);
    throw new Error(error.response?.data?.message || "Failed to fetch trainer slots");
  }
};