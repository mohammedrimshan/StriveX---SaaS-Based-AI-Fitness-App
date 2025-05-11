import { inject, injectable } from "tsyringe";
import { ISlotRepository } from "@/entities/repositoryInterfaces/slot/slot-repository.interface";
import { ISlotEntity } from "@/entities/models/slot.entity";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";
import { IGetSelectedTrainerSlotsUseCase } from "@/entities/useCaseInterfaces/slot/get-selected-trainer-slots-usecase.interface";

@injectable()
export class GetSelectedTrainerSlotsUseCase implements IGetSelectedTrainerSlotsUseCase {
  constructor(
    @inject("ISlotRepository") private readonly slotRepository: ISlotRepository,
    @inject("IClientRepository") private readonly clientRepository: IClientRepository
  ) {}

  async execute(userClientId: string): Promise<ISlotEntity[]> {
    if (!userClientId) {
      throw new CustomError("Client ID is required", HTTP_STATUS.BAD_REQUEST);
    }

    const client = await this.clientRepository.findByClientNewId(userClientId);
    console.log(client, "client in get selected trainer slots use case");
    if (!client) {
      throw new CustomError("Client not found", HTTP_STATUS.NOT_FOUND);
    }

    if (!client.selectedTrainerId) {
      return [];
    }

    const trainerSlots = await this.slotRepository.getSlotsWithStatus(client.selectedTrainerId);
    return trainerSlots;
  }
}