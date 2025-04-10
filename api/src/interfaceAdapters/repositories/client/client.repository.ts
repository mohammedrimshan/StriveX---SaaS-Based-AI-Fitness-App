// api\src\interfaceAdapters\repositories\client\client.repository.ts
import { injectable } from "tsyringe";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ClientModel } from "@/frameworks/database/mongoDB/models/client.model";
import { IClientEntity } from "@/entities/models/client.entity";
import { BaseRepository } from "../base.repository";
@injectable()
export class ClientRepository extends BaseRepository<IClientEntity> implements IClientRepository {
  constructor() {
    super(ClientModel);
  }

  async findByEmail(email: string): Promise<IClientEntity | null> {
    const client = await this.model.findOne({ email }).lean();
    if (!client) return null;
    return this.mapToEntity(client);
  }

  async updateByEmail(
    email: string,
    updates: Partial<IClientEntity>
  ): Promise<IClientEntity | null> {
    const client = await this.model
      .findOneAndUpdate({ email }, { $set: updates }, { new: true })
      .lean();
    if (!client) return null;
    return this.mapToEntity(client);
  }

  async findByIdAndUpdate(
    id: any,
    updateData: Partial<IClientEntity>
  ): Promise<IClientEntity | null> {
    const client = await this.model
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .lean();
    if (!client) return null;
    return this.mapToEntity(client);
  }

  async findByIdAndUpdatePassword(id: any, password: string): Promise<void> {
    await this.model.findByIdAndUpdate(id, { password });
  }

  async findByClientId(clientId: string): Promise<IClientEntity | null> {
    const client = await this.model.findOne({ clientId }).lean();
    if (!client) return null;
    return this.mapToEntity(client);
  }
}