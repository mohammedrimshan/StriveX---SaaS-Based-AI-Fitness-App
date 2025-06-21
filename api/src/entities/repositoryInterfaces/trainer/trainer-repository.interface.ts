import { ITrainerEntity } from "../../models/trainer.entity";
import { TrainerApprovalStatus } from "@/shared/constants";
import { IBaseRepository } from "../base-repository.interface";
import { IClientEntity } from "@/entities/models/client.entity";
import { ObjectId, Types } from "mongoose";
export interface ITrainerRepository extends IBaseRepository<ITrainerEntity> {
  findByEmail(email: string): Promise<ITrainerEntity | null>;
  findById(id: any): Promise<ITrainerEntity | null>;
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
  findBackupTrainerForClient(
    excludedTrainerId: string,
    specialization: string
  ): Promise<ITrainerEntity | null>;
  addBackupClient(
    trainerId: string,
    clientId: string
  ): Promise<ITrainerEntity | null>;
  removeBackupClient(
    trainerId: string,
    clientId: string
  ): Promise<ITrainerEntity | null>;
  updateOptOutBackupRole(
    trainerId: string,
    optOut: boolean
  ): Promise<ITrainerEntity | null>;
  findAvailableBackupTrainers(
    clientPreferences: Partial<IClientEntity>,
    excludedTrainerIds: Types.ObjectId[]
  ): Promise<ITrainerEntity[]>;
  findTrainerWithBackupClients(trainerId: string): Promise<any | null> ;
}
