import { IClientEntity } from "@/entities/models/client.entity";

export interface IAcceptRejectBackupInvitationUseCase {
  execute(invitationId: string, trainerId: string, action: "accept" | "reject"): Promise<IClientEntity>;
}