import { BackupInvitationStatus } from "@/shared/constants";
import { IClientEntity } from "../../models/client.entity";
import { IBaseRepository } from "../base-repository.interface";
import { ClientSession } from "mongoose";
export interface IClientRepository extends IBaseRepository<IClientEntity> {
  findByEmail(email: string): Promise<IClientEntity | null>;
  findById(id: any): Promise<IClientEntity | null>;
  updateByEmail(
    email: string,
    updates: Partial<IClientEntity>
  ): Promise<IClientEntity | null>;
  findByIdAndUpdate(
    id: any,
    updateData: Partial<IClientEntity>
  ): Promise<IClientEntity | null>;
  findByIdAndUpdatePassword(id: any, password: string): Promise<void>;
  findByClientId(clientId: string): Promise<IClientEntity | null>;
  updatePremiumStatus(
    clientId: string,
    isPremium: boolean
  ): Promise<IClientEntity>;
  updateByClientId(
    clientId: string,
    updates: Partial<IClientEntity>,
    session?: ClientSession
  ): Promise<IClientEntity | null>;
  findTrainerRequests(
    trainerId: string,
    skip: number,
    limit: number
  ): Promise<{ items: IClientEntity[] | []; total: number }>;
  findByClientNewId(clientId: string): Promise<IClientEntity | null>;
  findByIds(ids: string[]): Promise<{ id: string; name: string }[]>;
  findAcceptedClients(
  trainerId: string,
  skip: number,
  limit: number
): Promise<{ items: IClientEntity[] | []; total: number }>;
findUserSubscriptions(
    page: number,
    limit: number,
    search?: string,
    status?: "all" | "active" | "expired"
  ): Promise<{
    items: {
      clientId: string;
      clientName: string;
      profileImage?: string;
      subscriptionStartDate?: Date;
      subscriptionEndDate?: Date;
      isExpired: boolean;
      daysUntilExpiration: number;
      membershipPlanId?: string;
      planName?: string;
      amount?: number;
      status: string;
      remainingBalance?: number;
    }[];
    total: number;
  }>;
  updateBackupTrainer(clientId: string, backupTrainerId: string, status: BackupInvitationStatus): Promise<IClientEntity | null>;
  clearBackupTrainer(clientId: string): Promise<IClientEntity | null> ;
  updateBackupTrainerIfNotAssigned(
      clientId: string,
      trainerId: string,
      status: BackupInvitationStatus
    ): Promise<IClientEntity | null>;
    findClientsBySelectedTrainerId(trainerId: string): Promise<IClientEntity[]>;
    findClientsByBackupTrainerId(trainerId: string): Promise<IClientEntity[]>;
    findClientsByPreviousTrainerId(trainerId: string): Promise<IClientEntity[]>;
}
