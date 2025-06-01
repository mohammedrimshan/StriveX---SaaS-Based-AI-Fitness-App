import { IClientEntity } from "../../models/client.entity";
import { IBaseRepository } from "../base-repository.interface";
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
    updates: Partial<IClientEntity>
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
}
