// src/interfaceAdapters/repositories/client/client.repository.ts
import { injectable } from "tsyringe";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { IClientEntity } from "@/entities/models/client.entity";
import { ClientModel } from "@/frameworks/database/mongoDB/models/client.model";
import mongoose from "mongoose";

@injectable()
export class ClientRepository implements IClientRepository {
    async save(data: Partial<IClientEntity>): Promise<IClientEntity> {
        const savedClient = await ClientModel.create(data);
        return savedClient.toObject() as IClientEntity;
    }

    async findByEmail(email: string): Promise<IClientEntity | null> {
        const client = await ClientModel.findOne({ email }).lean();
        return client as IClientEntity | null;
    }

    async find(
        filter: any,
        skip: number,
        limit: number
    ): Promise<{ user: IClientEntity[] | []; total: number }> {
        const query = ClientModel.find(filter).lean();
        const total = await ClientModel.countDocuments(filter);
        const user = await query.skip(skip).limit(limit);
        return { user: user as IClientEntity[] | [], total };
    }

    async findById(id: any): Promise<IClientEntity | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        const client = await ClientModel.findById(id).lean();
        return client as IClientEntity | null;
    }

    async updateByEmail(
        email: string,
        updates: Partial<IClientEntity>
    ): Promise<IClientEntity | null> {
        const client = await ClientModel.findOneAndUpdate(
            { email },
            { $set: updates },
            { new: true }
        ).lean();
        return client as IClientEntity | null;
    }

    async findByIdAndUpdate(
        id: any,
        updateData: Partial<IClientEntity>
    ): Promise<IClientEntity | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        const client = await ClientModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        ).lean();
        return client as IClientEntity | null;
    }

    async findByIdAndUpdatePassword(id: any, password: string): Promise<void> {
        if (!mongoose.Types.ObjectId.isValid(id)) return;
        await ClientModel.findByIdAndUpdate(id, { $set: { password } });
    }

    async findByClientId(clientId: string): Promise<IClientEntity | null> {
        const client = await ClientModel.findOne({ clientId }).lean();
        return client as IClientEntity | null;
    }
}