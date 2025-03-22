import { authAxiosInstance } from "@/api/auth.axios";
import { IAuthResponse } from "@/types/Response";

export const googleAuth = async ({
	credential,
	client_id,
	role,
}: {
	credential: string;
	client_id: string;
	role: string;
}): Promise<IAuthResponse> => {
	const response = await authAxiosInstance.post<IAuthResponse>(
		"/google-auth",
		{
			credential,
			client_id,
			role,
		}
	);
	return response.data;
};
