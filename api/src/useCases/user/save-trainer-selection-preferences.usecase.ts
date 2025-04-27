import { inject, injectable } from "tsyringe";
import { ISaveTrainerSelectionPreferencesUseCase } from "@/entities/useCaseInterfaces/users/save-trainer-selection-preference-usecase.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { IClientEntity } from "@/entities/models/client.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS, WORKOUT_TYPES, FITNESS_GOALS, EXPERIENCE_LEVELS, SKILLS, TrainerSelectionStatus } from "@/shared/constants";

@injectable()
export class SaveTrainerSelectionPreferencesUseCase implements ISaveTrainerSelectionPreferencesUseCase {
  constructor(
    @inject("IClientRepository")
    private _clientRepository: IClientRepository
  ) {}

  async execute(clientId: string, preferences: Partial<IClientEntity>): Promise<IClientEntity> {

    console.log(clientId,"CLD")
    if (!clientId) {
      throw new CustomError(ERROR_MESSAGES.MISSING_PARAMETERS, HTTP_STATUS.BAD_REQUEST);
    }

    const { preferredWorkout: workoutType, fitnessGoal, sleepFrom, wakeUpAt, experienceLevel: skillLevel, skillsToGain, selectionMode } = preferences;

    // Validate inputs
    if (!workoutType || !WORKOUT_TYPES.includes(workoutType)) {
      throw new CustomError(ERROR_MESSAGES.INVALID_WORKOUT_TYPE, HTTP_STATUS.BAD_REQUEST);
    }
    if (!fitnessGoal || !FITNESS_GOALS.includes(fitnessGoal)) {
      throw new CustomError(ERROR_MESSAGES.GOAL_NOT_FOUND, HTTP_STATUS.BAD_REQUEST);
    }
    if (!skillLevel || !EXPERIENCE_LEVELS.includes(skillLevel)) {
      throw new CustomError(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST);
    }
    if (!skillsToGain || !Array.isArray(skillsToGain) || !skillsToGain.every(skill => SKILLS.includes(skill))) {
      throw new CustomError(ERROR_MESSAGES.INVALID_SKILL, HTTP_STATUS.BAD_REQUEST);
    }
    if (!selectionMode || !["auto", "manual"].includes(selectionMode)) {
      throw new CustomError(ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST);
    }
    if (!sleepFrom || !wakeUpAt || !this.isValidTime(sleepFrom) || !this.isValidTime(wakeUpAt)) {
      throw new CustomError(ERROR_MESSAGES.INVALID_TIME_RANGE, HTTP_STATUS.BAD_REQUEST);
    }

    // Check if client exists
    const existingPreferences = await this._clientRepository.findById(clientId);
    console.log(existingPreferences,"EXISTING")
    if (!existingPreferences) {
      throw new CustomError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Prepare update data
    const preferenceData: Partial<IClientEntity> = {
      preferredWorkout: workoutType,
      fitnessGoal,
      sleepFrom,
      wakeUpAt,
      experienceLevel: skillLevel,
      skillsToGain,
      selectionMode,
      selectStatus: TrainerSelectionStatus.PENDING,
    };

    // Update existing client
    const updatedPreferences = await this._clientRepository.update(clientId, preferenceData);
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