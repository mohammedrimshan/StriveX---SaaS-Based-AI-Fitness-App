import { trainerAxiosInstance } from "@/api/trainer.axios";
import { IAuthResponse } from "@/types/Response";
import { UserDTO } from "@/types/User";

// Complete trainer registration after initial signup
export const completeTrainerRegistration = async (userData: UserDTO): Promise<IAuthResponse> => {
  const response = await trainerAxiosInstance.post('/trainer/post-register', userData);
  return response.data;
};

// Get trainer profile information
export const getTrainerProfile = async (): Promise<any> => {
  const response = await trainerAxiosInstance.get('/trainer/profile');
  return response.data;
};

// Update trainer profile
export const updateTrainerProfile = async (profileData: Partial<UserDTO>): Promise<any> => {
  const response = await trainerAxiosInstance.put('/trainer/profile', profileData);
  return response.data;
};

// Get trainer dashboard statistics
export const getTrainerDashboardStats = async (): Promise<any> => {
  const response = await trainerAxiosInstance.get('/trainer/dashboard-stats');
  return response.data;
};

// Get trainer clients
export const getTrainerClients = async (page: number = 1, limit: number = 5): Promise<any> => {
  const response = await trainerAxiosInstance.get('/trainer/clients', {
    params: { page, limit }
  });
  return response.data;
};

// Get trainer sessions
export const getTrainerSessions = async (page: number = 1, limit: number = 5): Promise<any> => {
  const response = await trainerAxiosInstance.get('/trainer/sessions', {
    params: { page, limit }
  });
  return response.data;
};

// Update trainer availability
export const updateTrainerAvailability = async (availabilityData: any): Promise<any> => {
  const response = await trainerAxiosInstance.post('/trainer/availability', availabilityData);
  return response.data;
};

// Get trainer earnings
export const getTrainerEarnings = async (period: string = 'month'): Promise<any> => {
  const response = await trainerAxiosInstance.get('/trainer/earnings', {
    params: { period }
  });
  return response.data;
};

// Get trainer reviews
export const getTrainerReviews = async (page: number = 1, limit: number = 10): Promise<any> => {
  const response = await trainerAxiosInstance.get('/trainer/reviews', {
    params: { page, limit }
  });
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