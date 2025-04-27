import { IClientEntity } from "@/entities/models/client.entity";

export interface IAutoMatchTrainerUseCase {
    execute(clientId: string): Promise<IClientEntity>;
}   