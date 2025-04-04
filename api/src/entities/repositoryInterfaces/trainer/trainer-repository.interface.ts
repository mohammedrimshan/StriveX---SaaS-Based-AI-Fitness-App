import { ITrainerEntity } from "../../models/trainer.entity";
import { TrainerApprovalStatus } from "@/shared/constants";

export interface ITrainerRepository {
  save(data: Partial<ITrainerEntity>): Promise<ITrainerEntity | null>;
  findByEmail(email: string): Promise<ITrainerEntity | null>;
  findById(id: string): Promise<ITrainerEntity | null>;
  find(
    filter: any,
    skip: number,
    limit: number
  ): Promise<{ trainers: ITrainerEntity[] | []; total: number }>;
  updateByEmail(
    email: string,
    updates: Partial<ITrainerEntity>
  ): Promise<ITrainerEntity | null>;
  findByIdAndUpdate(
    id: string,
    updateData: Partial<ITrainerEntity>
  ): Promise<ITrainerEntity | null>;
  updateApprovalStatus(
    id: string,
    status: TrainerApprovalStatus,
    rejectionReason?: string,
    approvedByAdmin?: boolean
  ): Promise<ITrainerEntity | null>;
  findByIdAndUpdatePassword(id: any, password: string): Promise<void>;
}