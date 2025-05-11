import { inject, injectable } from "tsyringe";
import { ISaveTrainerSelectionPreferencesUseCase } from "@/entities/useCaseInterfaces/users/save-trainer-selection-preference-usecase.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { IClientEntity } from "@/entities/models/client.entity";
import { CustomError } from "@/entities/utils/custom.error";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  WORKOUT_TYPES,
  FITNESS_GOALS,
  EXPERIENCE_LEVELS,
  SKILLS,
  TrainerSelectionStatus,
} from "@/shared/constants";

@injectable()
export class SaveTrainerSelectionPreferencesUseCase implements ISaveTrainerSelectionPreferencesUseCase {
  constructor(
    @inject("IClientRepository")
    private _clientRepository: IClientRepository
  ) {}

  async execute(clientId: string, preferences: Partial<IClientEntity>): Promise<IClientEntity> {
    if (!clientId) {
      throw new CustomError(ERROR_MESSAGES.MISSING_PARAMETERS, HTTP_STATUS.BAD_REQUEST);
    }

    const {
      preferredWorkout,
      fitnessGoal,
      sleepFrom,
      wakeUpAt,
      experienceLevel,
      skillsToGain,
      selectionMode,
    } = preferences;

    if (!preferredWorkout || !WORKOUT_TYPES.includes(preferredWorkout)) {
      throw new CustomError(ERROR_MESSAGES.INVALID_WORKOUT_TYPE, HTTP_STATUS.BAD_REQUEST);
    }

    if (!fitnessGoal || !FITNESS_GOALS.includes(fitnessGoal)) {
      throw new CustomError(ERROR_MESSAGES.GOAL_NOT_FOUND, HTTP_STATUS.BAD_REQUEST);
    }

    if (!experienceLevel || !EXPERIENCE_LEVELS.includes(experienceLevel)) {
      throw new CustomError(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST);
    }

    if (
      !skillsToGain ||
      !Array.isArray(skillsToGain) ||
      !skillsToGain.every((skill) => SKILLS.includes(skill))
    ) {
      throw new CustomError(ERROR_MESSAGES.INVALID_SKILL, HTTP_STATUS.BAD_REQUEST);
    }

    if (!selectionMode || !["auto", "manual"].includes(selectionMode)) {
      throw new CustomError(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST);
    }

    if (!sleepFrom || !wakeUpAt || !this.isValidTime(sleepFrom) || !this.isValidTime(wakeUpAt)) {
      throw new CustomError(ERROR_MESSAGES.INVALID_TIME_RANGE, HTTP_STATUS.BAD_REQUEST);
    }

    const existingClient = await this._clientRepository.findById(clientId);
    if (!existingClient) {
      throw new CustomError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const updatedPreferences = await this._clientRepository.update(clientId, {
      preferredWorkout,
      fitnessGoal,
      sleepFrom,
      wakeUpAt,
      experienceLevel,
      skillsToGain,
      selectionMode,
      selectStatus: TrainerSelectionStatus.PENDING,
    });

    if (!updatedPreferences) {
      throw new CustomError(ERROR_MESSAGES.UPDATE_FAILED, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return updatedPreferences;
  }

  private isValidTime(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }
}
