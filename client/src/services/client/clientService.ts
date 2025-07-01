import { clientAxiosInstance } from "@/api/client.axios";
import { IAuthResponse } from "@/types/Response";
import { ClientTrainersResponse, IClient } from "@/types/User";
import { IAxiosResponse } from "@/types/Response";
import { UpdatePasswordData } from "@/hooks/client/useClientPasswordChange";
import { CategoryResponse } from "@/hooks/admin/useAllCategory";
import { IWorkoutPlan } from "@/types/Workout";
import { IDietPlan } from "@/types/Diet";
// import { PaginatedResult } from "@/types/Workout";
import { Review, ReviewInput, TrainerProfile, TrainerProfileType, UpdateReviewInput } from "@/types/trainer";

import { IWorkoutProgressEntity } from "../progress/workoutProgressService";
import { PaginatedTrainersResponse } from "@/types/Response";
import { PaginatedResponse } from "@/types/Response";
import { Exercise, WorkoutDetailsPro } from "@/types/Workouts";
import { MembershipPlansPaginatedResponse } from "@/types/membership";
import {
  SlotsResponse,
  BookSlotData,
  CancelSlotData,
  UserBookingsResponse,
} from "@/types/Slot";
import { IComment,IPost } from "@/types/Post";
import { CategoryType } from "@/hooks/admin/useAllCategory";
import { IWalletDetailsResponse } from "@/types/clientWallet";

export interface IExerciseEntity {
  _id?: string; 
  name: string;
  description: string;
  duration: number;
  defaultRestDuration: number;
  videoUrl: string;
}

export interface IWorkoutEntity {
  id?: string;
  title: string;
  description: string;
  category: string; 
  duration: number; 
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  imageUrl?: string; 
  exercises:IExerciseEntity[];
  isPremium: boolean; 
  status: boolean; 
  createdAt?: Date;
  updatedAt?: Date;
}
export interface IReport {
  userId: string;
  reason: string;
  reportedAt: string;
}


export interface CreateCheckoutSessionData {
  trainerId: string;
  planId: string;
  successUrl: string;
  cancelUrl: string;
  useWalletBalance?: boolean;
}

export interface CheckoutSessionResponse {
  success: boolean;
  message: string;
  url: string;
  balance?: number; 
  hasBalance?: boolean; 
  prompt?: string; 
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
): Promise<IWorkoutProgressEntity[]> => {
  const response = await clientAxiosInstance.get<
    IAxiosResponse<IWorkoutProgressEntity[]>
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
): Promise<PaginatedResponse<WorkoutDetailsPro>> => {
  const response = await clientAxiosInstance.get<
    IAxiosResponse<PaginatedResponse<WorkoutDetailsPro>>
  >(`/client/workouts`, {
    params: { page, limit, filter: JSON.stringify(filter) },
  });
  const rawData = response.data.data;

  const mappedData: PaginatedResponse<WorkoutDetailsPro> = {
    ...rawData,
    data: rawData.data.map((workout: any) => ({
      ...workout,
      id: workout._id?.toString() || workout.id,
      _id: workout._id?.toString(),
      category: {
        _id: workout.category?._id || workout.category,
        title: workout.category?.name || workout.category || "Unknown",
        metValue: workout.category?.metValue || 5,
        status: workout.category?.status ?? true,
      } as CategoryType,
      exercises: workout.exercises.map((exercise: any) => ({
        ...exercise,
        id: exercise._id?.toString() || exercise.id,
        _id: exercise._id?.toString(),
        videoUrl: exercise.videoUrl || "",
        duration: exercise.duration || 0,
        defaultRestDuration: exercise.defaultRestDuration || 0,
      })) as Exercise[],
    })),
  };

  console.log("Mapped workouts:", mappedData);
  return mappedData;
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
  trainerId: string,
  clientId: string
): Promise<TrainerProfileType> => {
  try {
    const response = await clientAxiosInstance.get<any>(
      `/client/trainers/${trainerId}`,
       { params: { clientId } }
    );
    console.log("Raw Response Status:", response.status);
    console.log("Raw Response Data:", response.data);

    const trainerData =
      response.data.data || response.data.trainer || response.data;
    if (!trainerData) {
      console.warn("No trainer data found in response:", response.data);
      throw new Error("Trainer not found or invalid response structure");
    }

    return trainerData as TrainerProfileType;
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

export const getMatchedTrainers = async (): Promise<MatchedTrainersResponse> => {
  const response = await clientAxiosInstance.get<MatchedTrainersResponse>("/client/matched-trainers");
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
  mediaUrl?: string;
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

export interface PaginatedPostsResponse {
  items: IPost[];
  total: number;
  currentSkip: number;
  limit: number;
}

export const getPosts = async (
  category?: string,
  sortBy?: 'latest' | 'likes' | 'comments',
  skip: number = 0,
  limit: number = 10
): Promise<PaginatedPostsResponse> => {
  try {
    const response = await clientAxiosInstance.get('/client/community/posts', {
      params: { category, sortBy, skip, limit },
    });
    console.log('getPosts raw response:', response.data);
    const data = response.data;
    return {
      items: data.posts || [],
      total: data.totalPosts || 0,
      currentSkip: data.currentSkip || skip,
      limit: data.limit || limit,
    };
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
    console.log('[DEBUG] Post fetched:', {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message,
      status: response.status,
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Post not found');
    }
    return response.data.data;
  } catch (error: any) {
    console.error('[DEBUG] Get post error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      name: error.name,
      code: error.code,
    });
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch post');
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
      { role }
    );

    console.log('[DEBUG] Like post raw response:', {
      status: response.status,
      data: response.data,
      timestamp: new Date().toISOString(),
    });

    // Check if the response is successful and contains a post
    if (response.status !== 200 || !response.data.success) {
      throw new Error(response.data.message || 'Failed to like/unlike post');
    }

    // Ensure post data exists
    if (!response.data.data) {
      console.warn('[DEBUG] Like post response missing data:', response.data);
      throw new Error('Invalid response: No post data returned');
    }

    console.log('[DEBUG] Like post response:', {
      post: response.data.data,
      timestamp: new Date().toISOString(),
    });
    return response.data.data;
  } catch (error: any) {
    console.error('[DEBUG] Like post error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      name: error.name,
      code: error.code,
      timestamp: new Date().toISOString(),
    });
    throw new Error(error.response?.data?.message || error.message || 'Failed to like/unlike post');
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

export interface PaginatedCommentsResponse {
  success: boolean;
  data: {
    comments: IComment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getComments = async (
  postId: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedCommentsResponse> => {
  try {
    const response = await clientAxiosInstance.get<PaginatedCommentsResponse>(
      `/client/community/posts/${postId}/comments`,
      {
        params: { page, limit },
      }
    );
    console.log('Comments fetched:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Get comments error:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Failed to fetch comments');
  }
};

export const upgradeSubscription = async (
  data: CreateCheckoutSessionData
): Promise<CheckoutSessionResponse> => {
  try {
    const response = await clientAxiosInstance.put<CheckoutSessionResponse>(
      "/client/upgrade",
      data
    );
    console.log("Subscription upgrade session created:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Upgrade subscription error:", error.response?.data);
    throw new Error(
      error.response?.data?.message || "Failed to create upgrade session"
    );
  }
};

export const getClientProfile = async (clientId: string): Promise<IClient> => {
  try {
    const response = await clientAxiosInstance.get<IAxiosResponse<IClient>>(
      `/client/${clientId}/profile`
    );
    console.log("Client profile fetched:", response.data);
    return response.data?.profile;
  } catch (error: any) {
    console.error("Get client profile error:", error.response?.data);
    throw new Error(
      error.response?.data?.message || "Failed to fetch client profile"
    );
  }
};

export const submitReview = async (review: ReviewInput): Promise<Review> => {
  try {
    const response = await clientAxiosInstance.put<{ success: boolean; data: Review }>(
      `/client/submitreview`,
      review
    );
    if (!response.data.success || !response.data.data) {
      throw new Error("Failed to submit review");
    }
    return response.data.data;
  } catch (error) {
    console.error("submitReview Error:", error);
    throw error;
  }
};

export const fetchTrainerReviews = async (
  trainerId: string,
  skip: number = 0,
  limit: number = 10
): Promise<{ items: Review[]; total: number }> => {
  try {
    const response = await clientAxiosInstance.get<{ success: boolean; data: { items: Review[]; total: number } }>(
      `/client/reviews/${trainerId}`,
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

export const updateReview = async (review: UpdateReviewInput & { clientId: string }): Promise<Review> => {
  try {
    const response = await clientAxiosInstance.put<{ success: boolean; data: Review }>(
      `/client/updatereview`,
      review
    );
    if (!response.data.success || !response.data.data) {
      throw new Error("Failed to update review");
    }
    return response.data.data;
  } catch (error) {
    console.error("updateReview Error:", error);
    throw error;
  }
};


export const getClientTrainersInfo = async (): Promise<ClientTrainersResponse> => {
  const response = await clientAxiosInstance.get<{ 
    success: boolean; 
    message: string; 
    data: ClientTrainersResponse; 
  }>("/client/trainers-info");

  return response.data.data;
};


export const checkWalletBalance = async (): Promise<CheckoutSessionResponse> => {
  const response = await clientAxiosInstance.get<CheckoutSessionResponse>("/client/walletbalance");
  return response.data;
};

// New function to get wallet details
export const getClientWalletDetails = async (
  year: number,
  month: number,
  page: number = 1,
  limit: number = 10
): Promise<IWalletDetailsResponse> => {
  const res = await clientAxiosInstance.get("/client/wallet", {
    params: { year, month, page, limit },
  });
  return res.data.data;
};