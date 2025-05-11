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
import {
  SlotsResponse,
  BookSlotData,
  CancelSlotData,
  UserBookingsResponse,
} from "@/types/Slot";

export interface IReport {
  userId: string;
  reason: string;
  reportedAt: string;
}

export interface IPost {
  id: string;
  authorId: string;
  role:string;
  textContent: string;
  mediaUrl?: string;
  category: string;
  likes: string[];
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  reports: IReport[];
}

export interface IComment {
  id: string;
  postId: string;
  authorId: string;
  textContent: string;
  likes: string[];
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  reports: IReport[];
}

export interface PaginatedPostsResponse {
  success: boolean;
  posts: IPost[];
  totalPosts: number;
  currentSkip: number;
  limit: number;
}

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

// Interface for trainer preferences payload
export interface TrainerPreferencesData {
  preferredWorkout: string;
  fitnessGoal: string;
  experienceLevel: string;
  skillsToGain: string[];
  selectionMode: "auto" | "manual";
  sleepFrom: string;
  wakeUpAt: string;
}

// Interface for trainer selection response
export interface TrainerSelectionResponse {
  success: boolean;
  message: string;
  preferences?: IClient;
}

// Interface for manual trainer selection payload
export interface ManualSelectTrainerData {
  trainerId: string;
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

export const saveTrainerSelectionPreferences = async (
  data: TrainerPreferencesData
): Promise<TrainerSelectionResponse> => {
  const response = await clientAxiosInstance.post<
    IAxiosResponse<TrainerSelectionResponse>
  >("/client/trainer-preferences", data);
  return response.data.data;
};

export const autoMatchTrainer = async (): Promise<TrainerSelectionResponse> => {
  const response = await clientAxiosInstance.post<
    IAxiosResponse<TrainerSelectionResponse>
  >("/client/auto-match-trainer");
  return response.data.data;
};

export const manualSelectTrainer = async (
  data: ManualSelectTrainerData
): Promise<TrainerSelectionResponse> => {
  const response = await clientAxiosInstance.post<
    IAxiosResponse<TrainerSelectionResponse>
  >("/client/manual-select-trainer", data);
  console.log(response.data, "MANUAL SELECT TRAINER RESPONSE");
  return response.data;
};

// Add to your clientService.ts
export interface MatchedTrainersResponse {
  success: boolean;
  data: TrainerProfile[];
}

export const getMatchedTrainers =
  async (): Promise<MatchedTrainersResponse> => {
    const response = await clientAxiosInstance.get<MatchedTrainersResponse>(
      "/client/matched-trainers"
    );
    return response.data;
  };

export interface SelectTrainerResponse {
  selectedTrainerId: string;
  selectStatus: "PENDING" | "APPROVED" | "REJECTED"; // Match your enum values
}

export const selectTrainerFromMatchedList = async (
  trainerId: string
): Promise<SelectTrainerResponse> => {
  const response = await clientAxiosInstance.post<
    IAxiosResponse<SelectTrainerResponse>
  >("/client/select-trainer", {
    selectedTrainerId: trainerId,
  });
  return response.data.data;
};

export const getTrainerSlots = async (): Promise<SlotsResponse> => {
  try {
    const response = await clientAxiosInstance.get<SlotsResponse>(
      `/client/trainerslots`
    );
    console.log("Trainer slots:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Get trainer slots error:", error.response?.data);
    throw new Error(
      error.response?.data?.message || "Failed to fetch trainer slots"
    );
  }
};

// Book a slot
export const bookSlot = async (data: BookSlotData): Promise<SlotsResponse> => {
  try {
    const response = await clientAxiosInstance.post<SlotsResponse>(
      "/client/book",
      data
    );
    console.log("Slot booked:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Book slot error:", error.response?.data);
    throw new Error(error.response?.data?.message || "Failed to book slot");
  }
};

// Cancel a booking
export const cancelBooking = async (
  data: CancelSlotData
): Promise<SlotsResponse> => {
  try {
    const response = await clientAxiosInstance.post<SlotsResponse>(
      "/client/cancel",
      data
    );
    console.log("Booking cancelled:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Cancel booking error:", error.response?.data);
    throw new Error(
      error.response?.data?.message || "Failed to cancel booking"
    );
  }
};

export const getBookingDetials = async (): Promise<UserBookingsResponse> => {
  try {
    const response = await clientAxiosInstance.get<UserBookingsResponse>(
      `/client/bookings`
    );
    console.log("Booking:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Get trainer slots error:", error.response?.data);
    throw new Error(
      error.response?.data?.message || "Failed to fetch trainer slots"
    );
  }
};

// Community Post Routes
// Community Post Routes
export const createPost = async (data: {
  textContent: string;
  media?: string;
  role: string;
}): Promise<IPost> => {
  try {
    const response = await clientAxiosInstance.post<IAxiosResponse<IPost>>(
      '/client/community/posts',
      data
    );
    console.log('Post created:', response.data);
    return response.data.data;
  } catch (error: any) {
    console.error('Create post error:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Failed to create post');
  }
};

export const getPosts = async (
  category?: string,
  sortBy?: 'latest' | 'likes' | 'comments',
  skip: number = 0,
  limit: number = 10
): Promise<PaginatedPostsResponse> => {
  try {
    const response = await clientAxiosInstance.get<
      IAxiosResponse<PaginatedPostsResponse>
    >('/client/community/posts', {
      params: { category, sortBy, skip, limit },
    });
    console.log('Posts fetched:', response.data);
    return response.data.data;
  } catch (error: any) {
    console.error('Get posts error:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Failed to fetch posts');
  }
};

export const getPost = async (id: string): Promise<IPost> => {
  try {
    const response = await clientAxiosInstance.get<IAxiosResponse<IPost>>(
      `/client/community/posts/${id}`
    );
    console.log('Post fetched:', response.data);
    return response.data.data;
  } catch (error: any) {
    console.error('Get post error:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Failed to fetch post');
  }
};

export const deletePost = async (id: string, role: string): Promise<void> => {
  try {
    const response = await clientAxiosInstance.delete<IAxiosResponse>(
      `/client/community/posts/${id}`,
      { data: { role } } // Send role in request body
    );
    console.log('Post deleted:', response.data);
  } catch (error: any) {
    console.error('Delete post error:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Failed to delete post');
  }
};

export const likePost = async (id: string, role: string): Promise<IPost> => {
  try {
    const response = await clientAxiosInstance.patch<IAxiosResponse<IPost>>(
      `/client/community/posts/${id}/like`,
      { role } // Send role in request body
    );
    console.log('Post liked:', response.data);
    return response.data.data;
  } catch (error: any) {
    console.error('Like post error:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Failed to like post');
  }
};

export const reportPost = async (
  id: string,
  reason: string,
  role: string
): Promise<IPost> => {
  try {
    const response = await clientAxiosInstance.post<IAxiosResponse<IPost>>(
      `/client/community/posts/${id}/report`,
      { reason, role }
    );
    console.log('Post reported:', response.data);
    return response.data.data;
  } catch (error: any) {
    console.error('Report post error:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Failed to report post');
  }
};

// Community Comment Routes
export const createComment = async (
  postId: string,
  textContent: string,
  role: string
): Promise<IComment> => {
  try {
    const response = await clientAxiosInstance.post<IAxiosResponse<IComment>>(
      `/client/community/posts/${postId}/comments`,
      { textContent, role }
    );
    console.log('Comment created:', response.data);
    return response.data.data;
  } catch (error: any) {
    console.error('Create comment error:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Failed to create comment');
  }
};

export const likeComment = async (id: string, role: string): Promise<IComment> => {
  try {
    const response = await clientAxiosInstance.patch<IAxiosResponse<IComment>>(
      `/client/community/comments/${id}/like`,
      { role }
    );
    console.log('Comment liked:', response.data);
    return response.data.data;
  } catch (error: any) {
    console.error('Like comment error:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Failed to like comment');
  }
};

export const deleteComment = async (id: string, role: string): Promise<void> => {
  try {
    const response = await clientAxiosInstance.delete<IAxiosResponse>(
      `/client/community/comments/${id}`,
      { data: { role } }
    );
    console.log('Comment deleted:', response.data);
  } catch (error: any) {
    console.error('Delete comment error:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Failed to delete comment');
  }
};

export const reportComment = async (
  id: string,
  reason: string,
  role: string
): Promise<IComment> => {
  try {
    const response = await clientAxiosInstance.post<IAxiosResponse<IComment>>(
      `/client/community/comments/${id}/report`,
      { reason, role }
    );
    console.log('Comment reported:', response.data);
    return response.data.data;
  } catch (error: any) {
    console.error('Report comment error:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Failed to report comment');
  }
};