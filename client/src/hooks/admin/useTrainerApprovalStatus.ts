import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToaster } from "../ui/useToaster";
import { updateTrainerApprovalStatus } from "../../services/admin/adminService";

export const useUpdateTrainerApprovalStatusMutation = () => {
    const { successToast, errorToast } = useToaster();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            trainerId,
            status,
            reason
        }: { trainerId: string; status: string; reason?: string }) => updateTrainerApprovalStatus({ trainerId, status, reason }),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["trainers"] });
            successToast(data.message);
        },
        onError: (error: any) => {
            errorToast(error.response?.data?.message || "An error occurred");
        },
    });
};
