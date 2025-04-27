import { IClientEntity } from "@/entities/models/client.entity";

export interface ITrainerAcceptRejectRequestUseCase {
  execute(
    trainerId: string,
    clientId: string,
    action: "accept" | "reject",
    rejectionReason?: string
  ): Promise<IClientEntity>;
}