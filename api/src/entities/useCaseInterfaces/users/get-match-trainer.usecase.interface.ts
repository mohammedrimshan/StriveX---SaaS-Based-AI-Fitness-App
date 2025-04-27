import { ITrainerEntity } from "@/entities/models/trainer.entity";

export interface IGetMatchedTrainersUseCase {
  execute(clientId: string): Promise<ITrainerEntity[]>;
}
