// api\src\entities\useCaseInterfaces\users\get-all-trainers.usecase.interface.ts
import { ITrainerEntity } from "@/entities/models/trainer.entity";

export interface IGetAllTrainersUseCase {
  execute(
    pageNumber: number,
    pageSize: number,
    searchTerm: string
  ): Promise<{ trainers: ITrainerEntity[]; total: number }>;
}