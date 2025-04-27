import { IClientEntity } from "@/entities/models/client.entity";


export interface ITrainerSelectionPreferenceUseCase {
    execute(clientId: string , preferences:Partial<IClientEntity>): Promise<IClientEntity>;
}