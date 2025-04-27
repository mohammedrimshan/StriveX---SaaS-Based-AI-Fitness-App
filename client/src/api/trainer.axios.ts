import axios from "axios";
import toast from "react-hot-toast";
import { store } from "@/store/store";
import { trainerLogout } from "@/store/slices/trainer.slice";

export const trainerAxiosInstance = axios.create({
	baseURL: import.meta.env.VITE_PRIVATE_API_URL + "/_tra",
	withCredentials: true,
});

let isRefreshing = false;

trainerAxiosInstance.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;
			if (!isRefreshing) {
				isRefreshing = true;
				try {
					await trainerAxiosInstance.post("/trainer/refresh-token");
					isRefreshing = false;
					return trainerAxiosInstance(originalRequest);
				} catch (refreshError) {
					isRefreshing = false;

					store.dispatch(trainerLogout());

					window.location.href = "/";
					toast("Please login again");
					return Promise.reject(refreshError);
				}
			}
		}

		if (
			(error.response.status === 403 &&
				error.response.data.message === "Token is blacklisted") ||
			(error.response.status === 403 &&
				error.response.data.message ===
					"Access denied: Your account has been blocked" &&
				!originalRequest._retry)
		) {
			console.log("Session ended");
			store.dispatch(trainerLogout());

			window.location.href = "/trainer";
			toast("Please login again");
			return Promise.reject(error);
		}

		return Promise.reject(error);
	}
);
