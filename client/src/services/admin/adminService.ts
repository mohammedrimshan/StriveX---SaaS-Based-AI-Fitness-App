import { adminAxiosInstance } from "@/api/admin.axios";
import { CategoryResponse } from "@/hooks/admin/useAllCategory";
import { FetchUsersParams, UsersResponse } from "@/hooks/admin/useAllUsers";
import { IAxiosResponse } from "@/types/Response";
import { IClient, ITrainer, IAdmin } from "@/types/User";
import { Workout, Exercise } from "@/types/Workouts";
import { MembershipPlanResponse,MembershipPlansPaginatedResponse } from "@/types/membership";
import { FetchSubscriptionsParams, SubscriptionsResponse } from "@/types/subscription.types";
import { FetchTransactionsParams, TransactionResponse } from "@/types/transaction";
export interface WorkoutExercise {
  _id?: string;
  id?:string;
  name: string;
  description: string;
  duration: number;
  defaultRestDuration: number;
  videoUrl: string;
}

export interface WorkoutType {
  _id?: string;
  id?:string;
  title: string;
  description: string;
  category: string;
  duration: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  imageUrl?: string;
  musicUrl?: string;
  exercises: WorkoutExercise[];
  isPremium: boolean;
  status: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WorkoutResponse {
  success: boolean;
  message: string;
  data: WorkoutType;
  category: string;
}

export interface WorkoutsPaginatedResponse {
  success: boolean;
  data: {
    data: WorkoutType[];
    total: number;
    page: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    totalPages: number;
  };
}

export interface UpdatePasswordData {
  oldPassword: string;
  newPassword: string;
}

export type AdminResponse = {
  success: boolean;
  message: string;
  user: IAdmin;
};

export type IUpdateAdminData = Pick<
  IAdmin,
  "firstName" | "lastName" | "email" | "phoneNumber" | "profileImage"
>;



// Interface for trainer request data
export interface TrainerRequest {
  id: string;
  client: string;
  preferences: {
    workoutType?: string;
    fitnessGoal?: string;
    skillLevel?: string;
    skillsToGain: string[];
  };
  matchedTrainers: { id: string; name: string }[];
  selectedTrainer: { id: string; name: string } | null;
  status: string;
}

// Interface for paginated trainer requests response
export interface TrainerRequestsPaginatedResponse {
  success: boolean;
  requests: TrainerRequest[];
  totalPages: number;
  currentPage: number;
  totalRequests: number;
}

// Interface for update trainer request payload
export interface UpdateTrainerRequestData {
  clientId: string;
  trainerId: string;
}

export const getAllUsers = async <T extends IClient | ITrainer>({
  userType,
  page = 1,
  limit = 5,
  search = "",
}: FetchUsersParams): Promise<UsersResponse<T>> => {
  const response = await adminAxiosInstance.get("/admin/users", {
    params: { userType, page, limit, search },
  });

  return {
    users: response.data.users,
    totalPages: response.data.totalPages,
    currentPage: response.data.currentPage,
  };
};

export const updateUserStatus = async (data: {
  userType: string;
  userId: string;
}): Promise<IAxiosResponse> => {
  const response = await adminAxiosInstance.patch(
    "/admin/user-status",
    {},
    {
      params: {
        userType: data.userType,
        userId: data.userId,
      },
    }
  );
  return response.data;
};

export const updateTrainerApprovalStatus = async ({
  trainerId,
  status,
  reason,
}: { trainerId: string; status: string; reason?: string }) => {
  try {
    const payload = {
      clientId: trainerId,
      approvalStatus: status.toLowerCase(),
      rejectionReason: reason,
    };
    console.log("Sending to backend:", payload);
    const response = await adminAxiosInstance.patch("/admin/trainer-approval", payload);
    console.log("Backend response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("API Error:", error.response?.data);
    throw new Error(error.response?.data?.message || "Failed to change trainer approval status");
  }
};

export const getAllCategories = async ({
  page = 1,
  limit = 10,
  search = "",
}: {
  page: number;
  limit: number;
  search: string;
}): Promise<CategoryResponse> => {
  const response = await adminAxiosInstance.get("/admin/categories", {
    params: { page, limit, searchTerm: search },
  });
  console.log("Categories response:", response.data);
  return response.data;
};

export const addAndEditCategory = async (categoryData: {
  id?: string;
  name: string;
  metValue:number;
  description?: string;
}): Promise<IAxiosResponse> => {
  if (categoryData.id) {
    const response = await adminAxiosInstance.put(
      `/admin/categories/${categoryData.id}`,
      { name: categoryData.name,metValue:categoryData.metValue, description: categoryData.description }
    );
    return response.data;
  } else {
    const response = await adminAxiosInstance.post("/admin/categories", {
      name: categoryData.name,
      metValue:categoryData.metValue,
      description: categoryData.description
    });
    console.log(response.data);
    return response.data;
  }
};

export const toggleCategoryStatus = async (categoryId: string, status: boolean): Promise<IAxiosResponse> => {
  const response = await adminAxiosInstance.patch(`/admin/categories/${categoryId}`, {
    status: status ? "false" : "true",
  });
  return response.data;
};

export const addWorkout = async (workoutData: WorkoutType, image?: string): Promise<WorkoutResponse> => {
  const payload = {
    ...workoutData,
    imageUrl: image,
  };
  console.log("Sending to backend:", payload);
  const response = await adminAxiosInstance.post("/admin/workouts", payload);
  return response.data;
};

// Updated updateWorkout
export const updateWorkout = async (
  workoutId: string,
  workoutData: Partial<WorkoutType>,
  files?: { image?: string; music?: string }
): Promise<WorkoutResponse> => {
  // If you want, use files.image and files.music here
  const payload = {
    ...workoutData,
    imageUrl: files?.image || workoutData.imageUrl || "",
    musicUrl: files?.music || workoutData.musicUrl || "", // if you track music url
  };
  console.log("Sending to backend:", payload);
  const response = await adminAxiosInstance.put(`/admin/workouts/${workoutId}`, payload);
  return response.data;
};

export const deleteWorkout = async (workoutId: string): Promise<IAxiosResponse> => {
  const response = await adminAxiosInstance.delete(`/admin/workouts/${workoutId}`);
  return response.data;
};

export const getAllWorkouts = async ({
  page = 1,
  limit = 10,
  filter = {},
}: {
  page: number;
  limit: number;
  filter: any;
}): Promise<WorkoutsPaginatedResponse> => {
  const response = await adminAxiosInstance.get("/admin/workouts", {
    params: { page, limit, filter: JSON.stringify(filter) },
  });
  return response.data;
};

export const toggleWorkoutStatus = async (workoutId: string): Promise<WorkoutResponse> => {
  const response = await adminAxiosInstance.patch(`/admin/workouts/${workoutId}/status`);
  return response.data;
};

export const addExercise = async (
  workoutId: string,
  exerciseData: Exercise
): Promise<Workout> => {
  const response = await adminAxiosInstance.post(`/admin/workouts/${workoutId}/exercises`, exerciseData);
  return response.data.data;
};

export const updateExercise = async (
  workoutId: string,
  exerciseId: string,
  exerciseData: Partial<Exercise>
): Promise<Workout> => {
  const response = await adminAxiosInstance.put(
    `/admin/workouts/${workoutId}/exercises/${exerciseId}`,
    exerciseData
  );
  return response.data.data;
};

export const deleteExercise = async (
  workoutId: string,
  exerciseId: string
): Promise<Workout> => {
  const response = await adminAxiosInstance.delete(
    `/admin/workouts/${workoutId}/exercises/${exerciseId}`
  );
  return response.data.data;
};

export const getWorkoutById = async (workoutId: string): Promise<WorkoutResponse> => {
  const response = await adminAxiosInstance.get(`/admin/workouts/${workoutId}`);
  console.log(response.data);
  return response.data;
};

export const addMembershipPlan = async (planData: {
	name: string;
	durationMonths: number;
	price: number;
  }): Promise<MembershipPlanResponse> => {
	try {
	  const response = await adminAxiosInstance.post("/admin/membership-plans", planData);
	  console.log("Add membership plan response:", response.data);
	  return {
		success: response.data.success,
		message: response.data.message,
		data: response.data.data || planData, 
	  };
	} catch (error: any) {
	  console.error("Add membership plan error:", error.response?.data);
	  throw new Error(error.response?.data?.message || "Failed to add membership plan");
	}
  };
  
  export const updateMembershipPlan = async (
	planId: string,
	planData: Partial<{
	  name: string;
	  durationMonths: number;
	  price: number;
	  isActive: boolean;
	}>
  ): Promise<MembershipPlanResponse> => {
	try {
	  const response = await adminAxiosInstance.put(`/admin/membership-plans/${planId}`, planData);
	  console.log("Update membership plan response:", response.data);
	  return {
		success: response.data.success,
		message: response.data.message,
		data: response.data.data || { id: planId, ...planData },
	  };
	} catch (error: any) {
	  console.error("Update membership plan error:", error.response?.data);
	  throw new Error(error.response?.data?.message || "Failed to update membership plan");
	}
  };
  
  export const deleteMembershipPlan = async (planId: string): Promise<IAxiosResponse> => {
	try {
	  const response = await adminAxiosInstance.delete(`/admin/membership-plans/${planId}`);
	  console.log("Delete membership plan response:", response.data);
	  return response.data;
	} catch (error: any) {
	  console.error("Delete membership plan error:", error.response?.data);
	  throw new Error(error.response?.data?.message || "Failed to delete membership plan");
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
	  const response = await adminAxiosInstance.get("/admin/membership-plans", {
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
	  throw new Error(error.response?.data?.message || "Failed to fetch membership plans");
	}
  };


  export const getTrainerRequests = async ({
    page = 1,
    limit = 10,
    search = "",
  }: {
    page: number;
    limit: number;
    search: string;
  }): Promise<TrainerRequestsPaginatedResponse> => {
    const response = await adminAxiosInstance.get<IAxiosResponse<TrainerRequestsPaginatedResponse>>(
      "/admin/trainer-requests",
      {
        params: { page, limit, search },
      }
    );
    return response.data.data;
  };

  
  export const updateTrainerRequest = async (
    data: UpdateTrainerRequestData
  ): Promise<IAxiosResponse> => {
    const response = await adminAxiosInstance.put<IAxiosResponse>(
      "/admin/trainer-request",
      data
    );
    return response.data;
  };
  

export const getTransactionHistory = async ({
  page = 1,
  limit = 10,
  userId,
  role,
  search = "",
  status, // Add status parameter
}: FetchTransactionsParams): Promise<TransactionResponse> => {
  try {
    const response = await adminAxiosInstance.get("/admin/transactions", {
      params: { page, limit, userId, role, search, status }, 
    });
    console.log("Get transaction history response:", response.data);
    return {
      success: true, 
      message: response.data.message, 
      transactions: response.data.transactions,
      totalPages: response.data.totalPages,
      currentPage: response.data.currentPage,
      totalTransactions: response.data.totalTransactions,
    };
  } catch (error: any) {
    console.error("Get transaction history error:", error.response?.data);
    throw new Error(error.response?.data?.message || "Failed to fetch transaction history");
  }
};


export const getUserSubscriptions = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "all",
}: FetchSubscriptionsParams): Promise<SubscriptionsResponse> => {
  try {
    const response = await adminAxiosInstance.get("/admin/user-subscriptions", {
      params: { page, limit, search, status },
    });
    console.log("Get user subscriptions response:", response.data);
    return {
      subscriptions: response.data.subscriptions,
      totalPages: response.data.totalPages,
      currentPage: response.data.currentPage,
      totalSubscriptions: response.data.totalSubscriptions,
    };
  } catch (error: any) {
    console.error("Get user subscriptions error:", error.response?.data);
    throw new Error(error.response?.data?.message || "Failed to fetch user subscriptions");
  }
};