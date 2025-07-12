import { inject, injectable } from "tsyringe";
import { IUpdateUserProfileUseCase } from "@/entities/useCaseInterfaces/users/update-user-profile-usecase.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { IClientProgressHistoryRepository } from "@/entities/repositoryInterfaces/progress/client-progress-history-repository.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS, WORKOUT_TYPES } from "@/shared/constants";
import { ICloudinaryService } from "@/interfaceAdapters/services/cloudinary.service";
import { IClientEntity } from "@/entities/models/client.entity";
import { IClientProgressHistoryEntity } from "@/entities/models/clientprogresshistory.model";
import { Types } from "mongoose";

@injectable()
export class UpdateUserProfileUseCase implements IUpdateUserProfileUseCase {
  constructor(
    @inject("IClientRepository")
    private _clientRepository: IClientRepository,
    @inject("ICloudinaryService")
    private _cloudinaryService: ICloudinaryService,
    @inject("IClientProgressHistoryRepository")
    private _clientProgressHistoryRepository: IClientProgressHistoryRepository
  ) {}

  async execute(
    userId: string,
    data: Partial<IClientEntity>
  ): Promise<IClientEntity> {
    const existingUser = await this._clientRepository.findById(userId);
    if (!existingUser) {
      throw new CustomError(
        ERROR_MESSAGES.USER_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }

    if (data.healthConditions) {
      if (!Array.isArray(data.healthConditions)) {
        throw new CustomError(
          "healthConditions must be an array",
          HTTP_STATUS.BAD_REQUEST
        );
      }
      data.healthConditions = data.healthConditions.map((condition) =>
        String(condition)
      );
    }

    if (data.preferredWorkout) {
      if (!WORKOUT_TYPES.includes(data.preferredWorkout)) {
        throw new CustomError(
          "Invalid preferredWorkout type",
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    if (data.waterIntakeTarget !== undefined) {
      if (
        typeof data.waterIntakeTarget !== "number" ||
        data.waterIntakeTarget < 0
      ) {
        throw new CustomError(
          "waterIntakeTarget must be a non-negative number",
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    if (data.weight !== undefined) {
      if (typeof data.weight !== "number" || data.weight <= 0) {
        throw new CustomError(
          "weight must be a positive number",
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }
    if (data.height !== undefined) {
      if (typeof data.height !== "number" || data.height <= 0) {
        throw new CustomError(
          "height must be a positive number",
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    if (
      data.profileImage &&
      typeof data.profileImage === "string" &&
      data.profileImage.startsWith("data:")
    ) {
      try {
        const uploadResult = await this._cloudinaryService.uploadImage(
          data.profileImage,
          {
            folder: "profile_images",
            public_id: `user_${userId}_${Date.now()}`,
          }
        );
        data.profileImage = uploadResult.secure_url;
      } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new CustomError(
          "Failed to upload profile image",
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
      }
    }

    const progressFields: Partial<IClientProgressHistoryEntity> = {
      userId: new Types.ObjectId(userId),
      date: new Date(),
    };
    let shouldSaveProgress = false;

    if (data.weight !== undefined) {
      progressFields.weight = data.weight;
      shouldSaveProgress = true;
    }
    if (data.height !== undefined) {
      progressFields.height = data.height;
      shouldSaveProgress = true;
    }
    if (data.waterIntake !== undefined) {
      progressFields.waterIntake = data.waterIntake;
      shouldSaveProgress = true;
    }
    if (data.waterIntakeTarget !== undefined) {
      progressFields.waterIntakeTarget = data.waterIntakeTarget;
      shouldSaveProgress = true;
    }

    if (shouldSaveProgress) {
      const latestProgress =
        await this._clientProgressHistoryRepository.findLatestByUserId(userId);

      const hasChanges =
        (progressFields.weight !== undefined &&
          progressFields.weight !== (latestProgress?.weight ?? 0)) ||
        (progressFields.height !== undefined &&
          progressFields.height !== (latestProgress?.height ?? 0)) ||
        (progressFields.waterIntake !== undefined &&
          progressFields.waterIntake !== (latestProgress?.waterIntake ?? 0)) ||
        (progressFields.waterIntakeTarget !== undefined &&
          progressFields.waterIntakeTarget !==
            (latestProgress?.waterIntakeTarget ?? 0));

      if (!hasChanges && latestProgress) {
        shouldSaveProgress = false;
      }
    }

    if (shouldSaveProgress) {
      try {
        const savedProgress = await this._clientProgressHistoryRepository.save(
          progressFields
        );
      } catch (error) {
        console.error("Failed to save client progress history:", error);
        throw new CustomError(
          "Failed to save progress history",
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
      }
    } 
    const updatedUser = await this._clientRepository.findByIdAndUpdate(
      userId,
      data
    );
    if (!updatedUser) {
      throw new CustomError(
        "Failed to update user profile",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    return updatedUser;
  }
}
