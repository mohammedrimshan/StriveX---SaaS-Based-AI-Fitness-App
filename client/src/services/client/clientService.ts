import { clientAxiosInstance } from "@/api/client.axios";
import { IAuthResponse } from "@/types/Response";
import { IClient } from "@/types/User";
import { IAxiosResponse } from "@/types/Response";
import { UpdatePasswordData } from "@/hooks/client/useClientPasswordChange";
import { CategoryResponse } from "../admin/adminService";
import { IWorkoutPlan } from "@/types/Workout";
import { IDietPlan } from "@/types/Diet";
// import { PaginatedResult } from "@/types/Workout";
import { TrainerProfile } from "@/types/trainer";
import { IWorkoutEntity } from "../../../../api/src/entities/models/workout.entity";
import { IProgressEntity } from "@/types/Progress";
import { PaginatedTrainersResponse } from "@/types/Response";
import { PaginatedResponse } from "@/types/Response";
import { Workout } from "@/types/Workouts";
import { MembershipPlansPaginatedResponse } from "@/types/membership";


export interface CreateCheckoutSessionData {
  trainerId: string;
  planId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResponse {
  success: boolean;
  message: string;
  url: string;
}



export const updateClientProfile = async (
  profileData: Partial<IClient>
): Promise<IAuthResponse> => {
  const response = await clientAxiosInstance.put(
    `/client/${profileData.id}/profile`,
    profileData
  );
  console.log(response.data);
  return response.data;
};

export const updateClientPassword = async ({
  currentPassword,
  newPassword,
}: UpdatePasswordData) => {
  const response = await clientAxiosInstance.put<IAxiosResponse>(
    "/client/update-password",
    {
      currentPassword,
      newPassword,
    }
  );
  console.log(response.data);
  return response.data;
};

export const getAllCategoriesForClient = async () => {
  const response = await clientAxiosInstance.get<CategoryResponse>(
    "/client/getallcategory"
  );
  return response.data;
};

export const generateWorkoutPlan = async (
  userId: string,
  data: any
): Promise<IWorkoutPlan> => {
  const response = await clientAxiosInstance.post<IWorkoutPlan>(
    `/client/${userId}/workout-plans`,

    data
  );
  console.log(response);
  console.log("Workout plan generated:", response.data);
  return response.data;
};

// New diet plan generation function
export const generateDietPlan = async (
  userId: string,
  data: any
): Promise<IDietPlan> => {
  const response = await clientAxiosInstance.post<IDietPlan>(
    `/client/${userId}/diet-plans`,
    data
  );
  console.log("Diet plan generated:", response.data);
  return response.data;
};

export const getWorkoutPlans = async (
  userId: string
): Promise<IWorkoutPlan[]> => {
  const response = await clientAxiosInstance.get<
    IAxiosResponse<IWorkoutPlan[]>
  >(`/client/${userId}/workout-plans`);
  console.log(response.data, "GET WORKOUT");
  return response.data.data;
};

export const getDietPlans = async (userId: string): Promise<IDietPlan[]> => {
  const response = await clientAxiosInstance.get<IAxiosResponse<IDietPlan[]>>(
    `/client/${userId}/diet-plans`
  );
  console.log(response.data, "GET diet");
  return response.data.data;
};

export const getUserProgress = async (
  userId: string
): Promise<IProgressEntity[]> => {
  const response = await clientAxiosInstance.get<
    IAxiosResponse<IProgressEntity[]>
  >(`/client/${userId}/progress`);
  console.log("User progress:", response.data);
  return response.data.data;
};

export const getWorkoutsByCategory = async (
  categoryId: string
): Promise<IWorkoutEntity[]> => {
  const response = await clientAxiosInstance.get<
    IAxiosResponse<IWorkoutEntity[]>
  >(`/client/workouts/category/${categoryId}`);
  console.log("Workouts by category:", response.data);
  return response.data.data;
};

export const getAllWorkouts = async (
  page: number = 1,
  limit: number = 10,
  filter: object = {}
): Promise<PaginatedResponse<Workout>> => {
  const response = await clientAxiosInstance.get<
    IAxiosResponse<PaginatedResponse<Workout>>
  >(`/client/workouts`, {
    params: { page, limit, filter: JSON.stringify(filter) },
  });
  console.log("All workouts:", response.data);
  return response.data.data;
};

export const getAllTrainers = async (
  page: number = 1,
  limit: number = 5,
  search: string = ""
): Promise<PaginatedTrainersResponse> => {
  const response = await clientAxiosInstance.get<PaginatedTrainersResponse>(
    "/client/trainers",
    {
      params: { page, limit, search },
    }
  );
  console.log("All trainers:", response.data);
  return response.data;
};

export const getAllCategoriesForClients = async () => {
  const response = await clientAxiosInstance.get<CategoryResponse>(
    "/client/getallcategory"
  );
  console.log(response.data, "fdd");
  return response.data;
};

export const getTrainerProfile = async (
  trainerId: string
): Promise<TrainerProfile> => {
  try {
    const response = await clientAxiosInstance.get<any>(
      `/client/trainers/${trainerId}`
    );
    console.log("Raw Response Status:", response.status);
    console.log("Raw Response Data:", response.data);

    const trainerData =
      response.data.data || response.data.trainer || response.data;
    if (!trainerData) {
      console.warn("No trainer data found in response:", response.data);
      throw new Error("Trainer not found or invalid response structure");
    }

    return trainerData as TrainerProfile;
  } catch (error) {
    console.error("getTrainerProfile Error:", error);
    throw error; // Ensure error propagates to useQuery
  }
};

export const getAllMembershipPlans = async ({
  page = 1,
  limit = 10,
  search = "",
}: {
  page: number;
  limit: number;
  search: string;
}): Promise<MembershipPlansPaginatedResponse> => {
  try {
    const response = await clientAxiosInstance.get("/client/payment/plans", {
      params: { page, limit, searchTerm: search },
    });
    console.log("Get all membership plans response:", response.data);
    return {
      success: response.data.success,
      plans: response.data.plans,
      totalPages: response.data.totalPages,
      currentPage: response.data.currentPage,
      totalPlans: response.data.totalPlans,
    };
  } catch (error: any) {
    console.error("Get all membership plans error:", error.response?.data);
    throw new Error(  
      error.response?.data?.message || "Failed to fetch membership plans"
    );
  }
};



export const createCheckoutSession = async (
  data: CreateCheckoutSessionData
): Promise<CheckoutSessionResponse> => {
  try {
    const response = await clientAxiosInstance.post<CheckoutSessionResponse>(
      "/client/payment/checkout",
      data
    );
    console.log("Checkout session created:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Create checkout session error:", error.response?.data);
    throw new Error(
      error.response?.data?.message || "Failed to create checkout session"
    );
  }
};