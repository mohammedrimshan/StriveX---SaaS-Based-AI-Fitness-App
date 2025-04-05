import { clientAxiosInstance} from "@/api/client.axios";
import { IAuthResponse } from "@/types/Response";
import { IClient } from "@/types/User";
import { IAxiosResponse } from "@/types/Response";
import { UpdatePasswordData } from "@/hooks/client/useClientPasswordChange";
import { CategoryResponse } from "../admin/adminService";
import { IWorkoutDay,IWorkoutExercise,IWorkoutPlan } from "@/types/Workout";
import { IMeal,IDietDay,IDietPlan } from "@/types/Diet";
import { IWorkoutEntity,PaginatedResult } from "@/types/Workouts";
import { IProgressEntity } from "@/types/Progress";
import { PaginatedTrainersResponse } from "@/types/Response";

export const updateClientProfile = async (profileData: Partial<IClient>): Promise<IAuthResponse> => {
  const response = await clientAxiosInstance.put(`/client/${profileData.id}/profile`, profileData)
  console.log(response.data)
  return response.data
}

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
  console.log(response.data)
  return response.data;
};



export const getAllCategoriesForClient = async () => {
  const response = await clientAxiosInstance.get<CategoryResponse>(
    "/client/getallcategory"
  );
  return response.data;
};


export const generateWorkoutPlan = async (userId: string, data: any): Promise<IWorkoutPlan> => {
  const response = await clientAxiosInstance.post<IWorkoutPlan>(
    `/client/${userId}/workout-plans`,
    
    data
  );
  console.log(response)
  console.log("Workout plan generated:", response.data);
  return response.data;
};

// New diet plan generation function
export const generateDietPlan = async (userId: string, data: any): Promise<IDietPlan> => {
  const response = await clientAxiosInstance.post<IDietPlan>(
    `/client/${userId}/diet-plans`,
    data
  );
  console.log("Diet plan generated:", response.data);
  return response.data;
};


export const getWorkoutPlans = async (userId: string): Promise<IWorkoutPlan[]> => {
  const response = await clientAxiosInstance.get<IAxiosResponse<IWorkoutPlan[]>>(
    `/client/${userId}/workout-plans`
  );
  console.log(response.data,"GET WORKOUT")
  return response.data.data;
};


export const getDietPlans = async (userId: string): Promise<IDietPlan[]> => {
  const response = await clientAxiosInstance.get<IAxiosResponse<IDietPlan[]>>(
    `/client/${userId}/diet-plans`
  );
  console.log(response.data,"GET diet")
  return response.data.data;

};


export const getUserProgress = async (userId: string): Promise<IProgressEntity[]> => {
  const response = await clientAxiosInstance.get<IAxiosResponse<IProgressEntity[]>>(
    `/client/${userId}/progress`
  );
  console.log("User progress:", response.data);
  return response.data.data;
};

export const getWorkoutsByCategory = async (categoryId: string): Promise<IWorkoutEntity[]> => {
  const response = await clientAxiosInstance.get<IAxiosResponse<IWorkoutEntity[]>>(
    `/client/workouts/category/${categoryId}`
  );
  console.log("Workouts by category:", response.data);
  return response.data.data;
};

export const getAllWorkouts = async (
  page: number = 1,
  limit: number = 10,
  filter: object = {}
): Promise<PaginatedResult<IWorkoutEntity>> => {
  const response = await clientAxiosInstance.get<IAxiosResponse<PaginatedResult<IWorkoutEntity>>>(
    `/client/workouts`,
    {
      params: { page, limit, filter: JSON.stringify(filter) },
    }
  );
  console.log("All workouts:", response.data);
  return response.data.data;
};

export const recordProgress = async (progressData: Omit<IProgressEntity, "_id">): Promise<IProgressEntity> => {
  const response = await clientAxiosInstance.post<IAxiosResponse<IProgressEntity>>(
    `/client/progress`,
    progressData
  );
  console.log("Progress recorded:", response.data);
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