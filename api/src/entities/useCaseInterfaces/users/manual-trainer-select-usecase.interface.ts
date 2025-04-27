import { IClientEntity } from "@/entities/models/client.entity";

export interface IManualSelectTrainerUseCase {
    execute(clientId: string,trainerId: string): Promise<IClientEntity>;
}   