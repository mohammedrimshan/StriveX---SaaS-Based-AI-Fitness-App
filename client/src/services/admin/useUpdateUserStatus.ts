import { updateUserStatus } from "@/services/admin/adminService";
import { IAxiosResponse } from "@/types/Response";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateUserStatusMutation = () => {
	const queryClient = useQueryClient();
	return useMutation<
		IAxiosResponse,
		Error,
		{ userType: string; userId: any }
	>({
		mutationFn: updateUserStatus,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
	});
};
