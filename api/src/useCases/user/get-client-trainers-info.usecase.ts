
import { inject, injectable } from "tsyringe";
import { IGetClientTrainersInfoUseCase } from "@/entities/useCaseInterfaces/users/get-client-trainers-info.usecase.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS } from "@/shared/constants";

@injectable()
export class GetClientTrainersInfoUseCase implements IGetClientTrainersInfoUseCase {
  constructor(
    @inject("IClientRepository") private _clientRepository: IClientRepository,
    @inject("ITrainerRepository") private _trainerRepository: ITrainerRepository
  ) {}

  async execute(clientId: string) {
    const client = await this._clientRepository.findById(clientId);
    if (!client) {
      throw new CustomError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const selectedTrainer =
      client.selectedTrainerId &&
      (await this._trainerRepository.findById(client.selectedTrainerId));

    const backupTrainer =
      client.backupTrainerId &&
      (await this._trainerRepository.findById(client.backupTrainerId));

    const mapTrainer = (trainer: any) =>
      trainer
        ? {
            id: trainer.id,
            firstName: trainer.firstName,
            lastName: trainer.lastName,
            specialization: trainer.specialization,
            profileImage: trainer.profileImage,
            phoneNumber: trainer.phoneNumber,
            email: trainer.email,
            experience: trainer.experience,
            gender: trainer.gender,
          }
        : null;

    return {
      selectedTrainer: mapTrainer(selectedTrainer),
      backupTrainer: mapTrainer(backupTrainer),
    };
  }
}
