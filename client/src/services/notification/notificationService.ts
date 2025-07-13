import { axiosInstance } from "@/api/private.axios";
import { UserRole } from "@/types/UserRole"; // "admin" | "client" | "trainer"

const getPrefix = (role: UserRole): string => {
  if (role === "admin") return "/admin";
  if (role === "trainer") return "/trainer";
  return "/client";
};

export const getUserNotifications = async (
  role: UserRole,
  page: number,
  limit: number
) => {
  console.log("getUserNotifications called with role:", role);
  const prefix = getPrefix(role);
  console.log("Using prefix:", prefix);
  const response = await axiosInstance.get(`${prefix}/notifications`, {
    params: { page, limit },
  });
  return response.data.data;
};


export const markNotificationAsRead = async (
  role: UserRole,
  notificationId: string
) => {
  const prefix = getPrefix(role);
  await axiosInstance.patch(`${prefix}/notifications/${notificationId}/read`);
};

export const updateFCMToken = async (
  role: UserRole,
  userId: string,
  fcmToken: string
) => {
  const prefix = getPrefix(role);
  await axiosInstance.post(`${prefix}/update-fcm-token`, {
    userId,
    fcmToken,
  });
};
