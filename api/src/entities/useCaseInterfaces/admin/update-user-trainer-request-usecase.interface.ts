import { IClientEntity } from "@/entities/models/client.entity";

export interface IUpdateTrainerRequestUseCase {
    execute(clientId: string, trainerId: string): Promise<IClientEntity>;
  }
  

  