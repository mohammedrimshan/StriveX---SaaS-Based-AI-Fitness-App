import { adminAxiosInstance } from "@/api/admin.axios";
import { FetchUsersParams, UsersResponse } from "@/hooks/admin/useAllUsers";
import { IAxiosResponse } from "@/types/Response";
import { IClient, ITrainer, IAdmin } from "@/types/User";

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