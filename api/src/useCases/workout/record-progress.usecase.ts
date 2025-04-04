import { inject, injectable } from "tsyringe";
import { IProgressRepository } from "@/entities/repositoryInterfaces/workout/progress-repository.interface";
import { IRecordProgressUseCase } from "@/entities/useCaseInterfaces/workout/record-progress-usecase.interface";
import { IProgressEntity } from "@/entities/models/progress.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";

@injectable()
export class RecordProgressUseCase implements IRecordProgressUseCase {
  constructor(
    @inject("IProgressRepository")
    private progressRepository: IProgressRepository
  ) {}

  async execute(progress: Omit<IProgressEntity, '_id'>): Promise<IProgressEntity> {
    try {
      const recordedProgress = await this.progressRepository.create(progress);
      return recordedProgress;
    } catch (error) {
      throw new CustomError(
        "Failed to record progress",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}