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

  async execute(userId: string, data: Partial<IClientEntity>): Promise<IClientEntity> {
    const existingUser = await this._clientRepository.findById(userId);
    if (!existingUser) {
      throw new CustomError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Validate healthConditions
    if (data.healthConditions) {
      if (!Array.isArray(data.healthConditions)) {
        throw new CustomError(
          "healthConditions must be an array",
          HTTP_STATUS.BAD_REQUEST
        );
      }
      data.healthConditions = data.healthConditions.map((condition) => String(condition));
    }

    // Validate preferredWorkout
    if (data.preferredWorkout) {
      if (!WORKOUT_TYPES.includes(data.preferredWorkout)) {
        throw new CustomError(
          "Invalid preferredWorkout type",
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    // Validate waterIntakeTarget
    if (data.waterIntakeTarget !== undefined) {
      if (typeof data.waterIntakeTarget !== "number" || data.waterIntakeTarget < 0) {
        throw new CustomError(
          "waterIntakeTarget must be a non-negative number",
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    // Validate weight
    if (data.weight !== undefined) {
      if (typeof data.weight !== "number" || data.weight <= 0) {
        throw new CustomError(
          "weight must be a positive number",
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    // Validate height
    if (data.height !== undefined) {
      if (typeof data.height !== "number" || data.height <= 0) {
        throw new CustomError(
          "height must be a positive number",
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    // Handle profile image upload if it’s a base64 string
    if (data.profileImage && typeof data.profileImage === "string" && data.profileImage.startsWith("data:")) {
      console.log("Profile image length:", data.profileImage.length);
      console.log("Profile image preview:", data.profileImage.substring(0, 50));
      try {
        const uploadResult = await this._cloudinaryService.uploadImage(data.profileImage, {
          folder: "profile_images",
          public_id: `user_${userId}_${Date.now()}`,
        });
        data.profileImage = uploadResult.secure_url;
      } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new CustomError(
          "Failed to upload profile image",
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
      }
    }

    // Check if we need to save progress history
    const progressFields: Partial<IClientProgressHistoryEntity> = {
      userId: new Types.ObjectId(userId),
      date: new Date(),
    };
    let shouldSaveProgress = false;

    // Set the fields that are being updated
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

    // If there are fields to save, compare with the latest entry
    if (shouldSaveProgress) {
      const latestProgress = await this._clientProgressHistoryRepository.findLatestByUserId(userId);

      // Compare with the latest entry to see if anything has changed
      const hasChanges =
        (progressFields.weight !== undefined && progressFields.weight !== (latestProgress?.weight ?? 0)) ||
        (progressFields.height !== undefined && progressFields.height !== (latestProgress?.height ?? 0)) ||
        (progressFields.waterIntake !== undefined && progressFields.waterIntake !== (latestProgress?.waterIntake ?? 0)) ||
        (progressFields.waterIntakeTarget !== undefined && progressFields.waterIntakeTarget !== (latestProgress?.waterIntakeTarget ?? 0));

      // If no changes and there's a previous entry, skip saving
      if (!hasChanges && latestProgress) {
        shouldSaveProgress = false;
      }
    }

    // Save progress history only if there are changes
    if (shouldSaveProgress) {
      try {
        console.log("Saving progress history:", JSON.stringify(progressFields, null, 2));
        const savedProgress = await this._clientProgressHistoryRepository.save(progressFields);
        console.log("Saved progress history:", JSON.stringify(savedProgress, null, 2));
      } catch (error) {
        console.error("Failed to save client progress history:", error);
        throw new CustomError(
          "Failed to save progress history",
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
      }
    } else {
      console.log("No changes in progress fields, skipping save to ClientProgressHistory.");
    }

    const updatedUser = await this._clientRepository.findByIdAndUpdate(userId, data);
    if (!updatedUser) {
      throw new CustomError(
        "Failed to update user profile",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    return updatedUser;
  }
}