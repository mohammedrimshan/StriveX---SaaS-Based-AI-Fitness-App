import { IClientEntity } from "@/entities/models/client.entity";
import { TrainerSelectionStatus } from "@/shared/constants";
export interface ISelectTrainerFromMatchedListUseCase {
  execute(clientId: string, selectedTrainerId: string): Promise<{
    selectedTrainerId: string;
    selectStatus: TrainerSelectionStatus;
  }>;
}
