import { googleAuth } from "@/services/auth/googleService";
import { useMutation } from "@tanstack/react-query";
import { IAuthResponse } from "@/types/Response";

export const useGoogleMutation = () => {
	return useMutation<
		IAuthResponse,
		Error,
		{ credential: any; client_id: any; role: string }
	>({
		mutationFn: googleAuth,
	});
};
