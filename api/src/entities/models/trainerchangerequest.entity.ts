import { TrainerChangeRequestStatus } from "@/shared/constants";

export interface ITrainerChangeRequestEntity {
    _id: string;
  clientId: string;
  backupTrainerId: string;
  requestType: "CHANGE" | "REVOKE";
  reason?: string;
  status: TrainerChangeRequestStatus;
  createdAt?: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}
