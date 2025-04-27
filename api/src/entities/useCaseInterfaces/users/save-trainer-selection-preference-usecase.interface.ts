import { IClientEntity } from "@/entities/models/client.entity";
export interface ISaveTrainerSelectionPreferencesUseCase {
    execute(clientId: string, preferences: Partial<IClientEntity>): Promise<IClientEntity>;
  }
  