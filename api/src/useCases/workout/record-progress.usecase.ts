import { inject, injectable } from "tsyringe";
import { IProgressRepository } from "@/entities/repositoryInterfaces/workout/progress-repository.interface";
import { IRecordProgressUseCase } from "@/entities/useCaseInterfaces/workout/record-progress-usecase.interface";
import { IProgressEntity } from "@/entities/models/progress.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS,ERROR_MESSAGES } from "@/shared/constants";

@injectable()
export class RecordProgressUseCase implements IRecordProgressUseCase {
  constructor(
    @inject("IProgressRepository")
    private _progressRepository: IProgressRepository
  ) {}

  async execute(progress: Omit<IProgressEntity, "_id">): Promise<IProgressEntity> {
    try {
      const recordedProgress = await this._progressRepository.create(progress);
      return recordedProgress;
    } catch {
      throw new CustomError(
        ERROR_MESSAGES.PROGRESS_RECORD_FAILED,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}