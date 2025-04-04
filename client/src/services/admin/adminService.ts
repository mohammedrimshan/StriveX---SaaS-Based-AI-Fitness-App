import { adminAxiosInstance } from "@/api/admin.axios";
import { FetchUsersParams, UsersResponse } from "@/hooks/admin/useAllUsers";
import { IAxiosResponse } from "@/types/Response";
import { IClient, ITrainer, IAdmin } from "@/types/User";

export interface WorkoutExercise {
  name: string;
  description: string;
  duration: number;
  defaultRestDuration: number;
}

export interface WorkoutType {
  _id?: string;
  title: string;
  description: string;
  category: string; // Category ID
  duration: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  imageUrl?: string;
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

export interface CategoryType {
	_id: string;
	title: string;
	description?: string;
	status: boolean;
	categoryId?: string; 
	createdAt?: string;
	updatedAt?: string;
	__v?: number;
  }
  
  export interface CategoryResponse {
	success: boolean;
	categories: CategoryType[];
	totalPages: number;
	currentPage: number;
	totalCategory: number;
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
	reason 
  }: { trainerId: string; status: string; reason?: string }) => {
	try {
	  const payload = {
		clientId: trainerId,
		approvalStatus: status.toLowerCase(),
		rejectionReason: reason
	  };
	  console.log("Sending to backend:", payload);
	  const response = await adminAxiosInstance.patch('/admin/trainer-approval', payload);
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
	  params: { page, limit, search },
	});
	return response.data;
  };
  
  export const addAndEditCategory = async (categoryData: {
	id?: string;
	name: string;
	description?: string;
  }): Promise<IAxiosResponse> => {
	if (categoryData.id) {
	  // Edit category (PUT)
	  const response = await adminAxiosInstance.put(
		`/admin/categories/${categoryData.id}`,
		{ name: categoryData.name, description: categoryData.description }
	  );
	  return response.data;
	} else {
	  // Add new category (POST)
	  const response = await adminAxiosInstance.post("/admin/categories", {
		name: categoryData.name,
		description: categoryData.description,
	  });
	  return response.data;
	}
  };
  
  export const toggleCategoryStatus = async (categoryId: string, status: boolean): Promise<IAxiosResponse> => {
	const response = await adminAxiosInstance.patch(`/admin/categories/${categoryId}`, {
	  status: status ? "false" : "true",
	});
	return response.data;
  };
  
  export const deleteCategory = async (categoryId: string): Promise<IAxiosResponse> => {
	const response = await adminAxiosInstance.delete(`/admin/categories/${categoryId}`);
	return response.data;
  };

  export const addWorkout = async (workoutData: WorkoutType, image?: string): Promise<WorkoutResponse> => {
	const response = await adminAxiosInstance.post("/admin/workouts", {
	  ...workoutData,
	  image, // Send image as a separate field if provided
	});
	return response.data;
  };
  
  // Update an existing workout
  export const updateWorkout = async (
	workoutId: string,
	workoutData: Partial<WorkoutType>,
	image?: string
  ): Promise<WorkoutResponse> => {
	const response = await adminAxiosInstance.put(`/admin/workouts/${workoutId}`, {
	  ...workoutData,
	  image,
	});
	return response.data;
  };
  
  // Delete a workout
  export const deleteWorkout = async (workoutId: string): Promise<IAxiosResponse> => {
	const response = await adminAxiosInstance.delete(`/admin/workouts/${workoutId}`);
	return response.data;
  };
  
  // Get all workouts (paginated)
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
  
  // Toggle workout status (assuming this endpoint exists)
  export const toggleWorkoutStatus = async (workoutId: string): Promise<WorkoutResponse> => {
	const response = await adminAxiosInstance.patch(`/admin/workouts/${workoutId}/status`);
	return response.data;
  };