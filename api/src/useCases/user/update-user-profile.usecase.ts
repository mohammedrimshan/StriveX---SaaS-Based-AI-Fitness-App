import { inject, injectable } from "tsyringe";
import { IUpdateUserProfileUseCase } from "@/entities/useCaseInterfaces/users/update-user-profile-usecase.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS, WORKOUT_TYPES } from "@/shared/constants";
import { ICloudinaryService } from "@/interfaceAdapters/services/cloudinary.service";
import { IClientEntity } from "@/entities/models/client.entity";

@injectable()
export class UpdateUserProfileUseCase implements IUpdateUserProfileUseCase {
  constructor(
    @inject("IClientRepository")
    private _clientRepository: IClientRepository,
    @inject("ICloudinaryService")
    private _cloudinaryService: ICloudinaryService 
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
