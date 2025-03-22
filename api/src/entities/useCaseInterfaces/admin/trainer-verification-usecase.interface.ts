import { TrainerApprovalStatus } from "@/shared/constants";
export interface ITrainerVerificationUseCase {
	execute(clientId: string, approvalStatus: TrainerApprovalStatus, rejectionReason?: string): Promise<void>;
}
