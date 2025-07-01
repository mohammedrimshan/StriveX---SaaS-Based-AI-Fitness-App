// D:\StriveX\client\src\api\private.axios.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import toast from "react-hot-toast";
import { store } from "@/store/store";
import { adminLogout } from "@/store/slices/admin.slice";
import { clientLogout } from "@/store/slices/client.slice";
import { trainerLogout } from "@/store/slices/trainer.slice";

type Role = "admin" | "client" | "trainer" | "";

// Extend Axios request config to include custom _retry property
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface ErrorResponse {
  message?: string;
}

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_PRIVATE_API_URL, 
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(null);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    const originalRequest = error.config as CustomAxiosRequestConfig | undefined;

    // If no config or URL, reject immediately
    if (!originalRequest || !originalRequest.url) {
      console.error("No original request or URL:", error);
      return Promise.reject(error);
    }

    // Extract role from URL prefix
    const url = originalRequest.url;
    const urlPrefix = url.split("/")[1] || "";
    let role: Role = "";

    switch (urlPrefix) {
      case "_ad":
        role = "admin";
        break;
      case "_cl":
        role = "client";
        break;
      case "_tra":
        role = "trainer";
        break;
      default:
        console.warn(`Unknown URL prefix: ${urlPrefix}`, { url });
        return Promise.reject(error);
    }

    const message = error.response?.data?.message ?? "";

    // Handle token expired & retry with refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      (message === "Token Expired" || message === "Unauthorized" || !message) // Handle multiple cases
    ) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshEndpoint = `/${urlPrefix}/${role}/refresh-token`; // e.g., /_ad/admin/refresh-token
          console.log(`Attempting token refresh for ${role} at ${import.meta.env.VITE_PRIVATE_API_URL}${refreshEndpoint}`);
          const response = await axiosInstance.post(refreshEndpoint);
          console.log(`Token refresh successful for ${role}:`, response.data);
          isRefreshing = false;
          processQueue(null);
          return axiosInstance(originalRequest);
        } catch (refreshError: any) {
          console.error(`Token refresh failed for ${role}:`, {
            status: refreshError.response?.status,
            data: refreshError.response?.data,
            message: refreshError.message,
          });
          isRefreshing = false;
          processQueue(refreshError);
          handleLogout(role);
          return Promise.reject(refreshError);
        }
      }

      // Queue the request until refresh is complete
      console.log(`Queuing request for ${url} during refresh`);
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => axiosInstance(originalRequest));
    }

    // Handle blacklisted or blocked tokens
    if (
      error.response?.status === 403 &&
      !originalRequest._retry &&
      ["Token is blacklisted", "Access denied: Your account has been blocked"].includes(message)
    ) {
      originalRequest._retry = true;
      console.log(`Handling 403 error for ${role}: ${message}`);
      handleLogout(role);
      return Promise.reject(error);
    }

    console.error("Request failed:", { url, status: error.response?.status, message });
    return Promise.reject(error);
  }
);

function handleLogout(role: Role) {
  if (!role) {
    console.warn("No role specified for logout");
    toast.error("Session expired. Please login again.", { duration: 3000 });
    return;
  }

  console.log(`Logging out role: ${role}`);
  switch (role) {
    case "admin":
      store.dispatch(adminLogout());
      window.location.href = "/admin";
      break;
    case "client":
      store.dispatch(clientLogout());
      window.location.href = "/";
      break;
    case "trainer":
      store.dispatch(trainerLogout());
      window.location.href = "/trainer";
      break;
  }

  toast.error("Please login again.", { duration: 3000 });
}