import { inject, injectable } from "tsyringe";
import { IGetTrainerSlotsUseCase } from "../../entities/useCaseInterfaces/slot/get-trainer-slots-usecase.interface";
import { ISlotRepository } from "../../entities/repositoryInterfaces/slot/slot-repository.interface";
import { ITrainerRepository } from "../../entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { IClientRepository } from "../../entities/repositoryInterfaces/client/client-repository.interface";
import { ISlotEntity } from "@/entities/models/slot.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS } from "@/shared/constants";

@injectable()
export class GetTrainerSlotsUseCase implements IGetTrainerSlotsUseCase {
  constructor(
    @inject("ISlotRepository") private slotRepository: ISlotRepository,
    @inject("ITrainerRepository") private trainerRepository: ITrainerRepository,
    @inject("IClientRepository") private clientRepository: IClientRepository
  ) {}

  async execute(
    trainerId: string,
    startTime?: Date,
    endTime?: Date,
    role?: "trainer" | "client"
  ): Promise<
    Array<
      Omit<ISlotEntity, "id" | "startTime" | "endTime"> & {
        id: string;
        date: string;
        startTime: string;
        endTime: string;
        isBooked: boolean;
        isAvailable: boolean;
      }
    >
  > {
    // Validate trainerId
    if (!trainerId) {
      throw new CustomError(
        "Trainer ID is required",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Validate role
    if (role && role !== "trainer" && role !== "client") {
      throw new CustomError(
        "Role must be either 'trainer' or 'client'",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Verify user based on role
    if (role === "trainer") {
      const trainer = await this.trainerRepository.findById(trainerId);
      if (!trainer) {
        throw new CustomError(
          ERROR_MESSAGES.TRAINER_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND
        );
      }
    } else if (role === "client") {
      const client = await this.clientRepository.findById(trainerId);
      if (!client) {
        throw new CustomError(
          ERROR_MESSAGES.USER_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND
        );
      }
    }

    // Fetch slots
    const slots = await this.slotRepository.getSlotsWithStatus(
      trainerId,
      startTime,
      endTime
    );
    return slots;
  }
}