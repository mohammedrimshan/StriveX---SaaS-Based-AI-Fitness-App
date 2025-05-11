import { inject, injectable } from "tsyringe";
import { IProgressRepository } from "@/entities/repositoryInterfaces/workout/progress-repository.interface";
import { IGetUserProgressUseCase } from "@/entities/useCaseInterfaces/workout/get-user-progress-usecase.interface";
import { IProgressEntity } from "@/entities/models/progress.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS } from "@/shared/constants";

export class GetUserProgressUseCase implements IGetUserProgressUseCase {
  constructor(
    @inject("IProgressRepository")
    private _progressRepository: IProgressRepository
  ) {}

  async execute(userId: string): Promise<IProgressEntity[]> {
    if (!userId) {
      throw new CustomError(
        ERROR_MESSAGES.ID_REQUIRED,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    try {
      const progress = await this._progressRepository.findByUser(userId);
      return progress;
    } catch (error) {
      throw new CustomError(
        ERROR_MESSAGES.FAILED_TO_FETCH_PROGRESS,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}
