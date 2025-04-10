import { ITrainerEntity } from "../../models/trainer.entity";
import { TrainerApprovalStatus } from "@/shared/constants";
import { IBaseRepository } from "../base-repository.interface";
export interface ITrainerRepository extends IBaseRepository<ITrainerEntity>{
  findByEmail(email: string): Promise<ITrainerEntity | null>;
  findById(id: string): Promise<ITrainerEntity | null>;
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