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
    @inject("ITrainerRepository") private _trainerRepository: ITrainerRepository,
    @inject("ICloudinaryService") private _cloudinaryService: ICloudinaryService
  ) {}

  async execute(trainerId: string, data: Partial<ITrainerEntity>): Promise<ITrainerEntity> {
    const existingTrainer = await this._trainerRepository.findById(trainerId);
    if (!existingTrainer) {
      throw new CustomError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (data.profileImage && typeof data.profileImage === "string" && data.profileImage.startsWith("data:")) {
      const uploadResult = await this._cloudinaryService.uploadImage(data.profileImage, {
        folder: "trainer_profiles",
        public_id: `trainer_${trainerId}_${Date.now()}`,
      });
      data.profileImage = uploadResult.secure_url;
    }

    if (data.certifications && Array.isArray(data.certifications)) {
      const uploadedCerts: string[] = [];
      for (const cert of data.certifications) {
        if (typeof cert === "string" && cert.startsWith("data:")) {
          const uploadResult = await this._cloudinaryService.uploadFile(cert, {
            folder: "trainer_certifications",
            public_id: `cert_${trainerId}_${Date.now()}_${uploadedCerts.length}`,
            resource_type: "auto",
          });
          uploadedCerts.push(uploadResult.secure_url);
        } else {
          uploadedCerts.push(cert);
        }
      }
      data.certifications = uploadedCerts;
    }

    const updatedTrainer = await this._trainerRepository.findByIdAndUpdate(trainerId, data);
    if (!updatedTrainer) {
      throw new CustomError(
        ERROR_MESSAGES.FAILED_TO_UPDATE,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    return updatedTrainer;
  }
}
