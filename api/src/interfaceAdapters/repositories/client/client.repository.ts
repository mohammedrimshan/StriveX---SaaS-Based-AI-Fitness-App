import { injectable } from "tsyringe";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ClientModel } from "@/frameworks/database/mongoDB/models/client.model";
import { IClientEntity } from "@/entities/models/client.entity";


@injectable()
export class ClientRepository implements IClientRepository{
    async save(data: Partial<IClientEntity>): Promise<IClientEntity> {
        return await ClientModel.create(data)
    }

    async findByEmail(email: string): Promise<IClientEntity | null> {
        const client = await ClientModel.findOne({email}).lean()
        if(!client) return null

        return {
            ...client,
            id:client._id.toString(),
        } as IClientEntity
    }
    async findById(id: any): Promise<IClientEntity | null> {
        const client = await ClientModel.findById(id).lean();
        if(!client) return null;

        return {
            ...client,
            id:client._id.toString(),
        } as IClientEntity
    }
}