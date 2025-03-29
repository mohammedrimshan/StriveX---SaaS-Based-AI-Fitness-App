
import { inject, injectable } from "tsyringe";
import { IUpdateTrainerProfileUseCase } from "@/entities/useCaseInterfaces/trainer/update-trainer-profile.usecase.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { ITrainerEntity } from "@/entities/models/trainer.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS } from "@/shared/constants";
import { ICloudinaryService } from "@/interfaceAdapters/services/cloudinary.service";

@injectable()
export class UpdateTrainerProfileUseCase implements IUpdateTrainerProfileUseCase {
  constructor(
    @inject("ITrainerRepository") private trainerRepository: ITrainerRepository,
    @inject("ICloudinaryService") private cloudinaryService: ICloudinaryService
  ) {}

  async execute(trainerId: string, data: Partial<ITrainerEntity>): Promise<ITrainerEntity> {
    const existingTrainer = await this.trainerRepository.findById(trainerId);
    if (!existingTrainer) {
      throw new CustomError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Handle profile image upload to Cloudinary
    if (data.profileImage && typeof data.profileImage === "string" && data.profileImage.startsWith("data:")) {
      try {
        const uploadResult = await this.cloudinaryService.uploadImage(data.profileImage, {
          folder: "trainer_profiles",
          public_id: `trainer_${trainerId}_${Date.now()}`,
        });
        data.profileImage = uploadResult.secure_url;
      } catch (error) {
        console.error("Profile image upload error:", error);
        throw new CustomError(
          "Failed to upload profile image",
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
      }
    }

    // Handle certificate uploads to Cloudinary
    if (data.certifications && Array.isArray(data.certifications)) {
      const uploadedCerts: string[] = [];
      for (const cert of data.certifications) {
        if (typeof cert === "string" && cert.startsWith("data:")) {
          try {
            const uploadResult = await this.cloudinaryService.uploadFile(cert, {
              folder: "trainer_certifications",
              public_id: `cert_${trainerId}_${Date.now()}_${uploadedCerts.length}`,
              resource_type: "auto",
            });
            uploadedCerts.push(uploadResult.secure_url);
          } catch (error) {
            console.error("Certificate upload error:", error);
            throw new CustomError(
              "Failed to upload certificate",
              HTTP_STATUS.INTERNAL_SERVER_ERROR
            );
          }
        } else {
          // Preserve existing certificate URLs
          uploadedCerts.push(cert);
        }
      }
      data.certifications = uploadedCerts;
    }

    const updatedTrainer = await this.trainerRepository.findByIdAndUpdate(trainerId, data);
    if (!updatedTrainer) {
      throw new CustomError(
        "Failed to update trainer profile",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    return updatedTrainer;
  }
}