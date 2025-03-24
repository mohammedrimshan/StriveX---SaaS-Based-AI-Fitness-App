import { IClientEntity } from "../../models/client.entity";

export interface IClientRepository {
  save(data: Partial<IClientEntity>): Promise<IClientEntity>;
  findByEmail(email: string): Promise<IClientEntity | null>;
  find(
    filter: any,
    skip: number,
    limit: number
  ): Promise<{ user: IClientEntity[] | []; total: number }>;
  findById(id: any): Promise<IClientEntity | null>;
  updateByEmail(
    email: string,
    updates: Partial<IClientEntity>
  ): Promise<IClientEntity | null>;
  findByIdAndUpdate(
    id: any,
    updateData: Partial<IClientEntity>
  ): Promise<IClientEntity | null>;
}