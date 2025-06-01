import { clientAxiosInstance } from '@/api/client.axios';
import { trainerAxiosInstance } from '@/api/trainer.axios';
import { UserRole } from '@/types/UserRole';

const getAxiosInstance = (role: UserRole) => {
  return role === 'trainer' ? trainerAxiosInstance : clientAxiosInstance;
};

const getPrefix = (role: UserRole) => {
  return role === 'trainer' ? '/trainer' : '/client';
};

// export const getAllNotifications = async (
//   role: UserRole,
//   page: number,
//   limit: number
// ) => {
//   const axiosInstance = getAxiosInstance(role);
//   const prefix = getPrefix(role);
//   const response = await axiosInstance.get(`${prefix}/notifications`, {
//     params: { page, limit },
//   });
//   return response.data.data;
// };

export const getUserNotifications = async (
  role: UserRole,
  page: number,
  limit: number
) => {
  const axiosInstance = getAxiosInstance(role);
  const prefix = getPrefix(role);
  const response = await axiosInstance.get(`${prefix}/notifications`, {
    params: { page, limit },
  });
  console.log(response.data);
  return response.data.data;
};

export const markNotificationAsRead = async (
  role: UserRole,
  notificationId: string
) => {
  const axiosInstance = getAxiosInstance(role);
  const prefix = getPrefix(role);
  await axiosInstance.patch(`${prefix}/notifications/${notificationId}/read`);
};


export const updateFCMToken = async (
  role: UserRole,
  userId: string,
  fcmToken: string
) => {
  const axiosInstance = getAxiosInstance(role);
  const prefix = getPrefix(role);
  await axiosInstance.post(`${prefix}/update-fcm-token`, {
    userId,
    fcmToken,
  });
};