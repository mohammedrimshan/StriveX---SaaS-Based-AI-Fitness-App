import { inject, injectable } from "tsyringe";
import { IGetChatParticipantsUseCase } from "@/entities/useCaseInterfaces/chat/get-chat-participants-usecase.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS, ROLES, TrainerSelectionStatus, TRole } from "@/shared/constants";

@injectable()
export class GetChatParticipantsUseCase implements IGetChatParticipantsUseCase {
  constructor(
    @inject("IClientRepository") private _clientRepository: IClientRepository,
    @inject("ITrainerRepository") private _trainerRepository: ITrainerRepository
  ) {}

  async execute(
    userId: string,
    role: TRole
  ): Promise<Array<{ id: string; name: string; avatar: string; status: "online" | "offline" }>> {
    if (!Object.values(ROLES).includes(role)) {
      throw new CustomError(`Invalid user role: ${role}`, HTTP_STATUS.BAD_REQUEST);
    }

    const participants: Array<{ id: string; name: string; avatar: string; status: "online" | "offline" }> = [];

    if (role === ROLES.USER) {
      const client = await this._clientRepository.findById(userId);
      if (!client) throw new CustomError("Client not found", HTTP_STATUS.NOT_FOUND);
      if (!client.isPremium) throw new CustomError("Client is not a premium user", HTTP_STATUS.FORBIDDEN);
      if (client.selectStatus !== TrainerSelectionStatus.ACCEPTED) {
        throw new CustomError("Client does not have an assigned trainer", HTTP_STATUS.FORBIDDEN);
      }
      if (!client.selectedTrainerId) {
        throw new CustomError("No trainer assigned to client", HTTP_STATUS.FORBIDDEN);
      }

      const trainer = await this._trainerRepository.findById(client.selectedTrainerId);
      if (!trainer) throw new CustomError("Assigned trainer not found", HTTP_STATUS.NOT_FOUND);

      participants.push({
        id: trainer.id!,
        name: `${trainer.firstName} ${trainer.lastName}`,
        avatar: trainer.profileImage || "",
        status: trainer.isOnline ? "online" : "offline",
      });
    } else if (role === ROLES.TRAINER) {
      const trainer = await this._trainerRepository.findById(userId);
      if (!trainer) throw new CustomError("Trainer not found", HTTP_STATUS.NOT_FOUND);

      const { items: clients } = await this._clientRepository.find(
        { selectedTrainerId: userId, selectStatus: TrainerSelectionStatus.ACCEPTED },
        0,
        100
      );

      for (const client of clients) {
        participants.push({
          id: client.id!,
          name: `${client.firstName} ${client.lastName}`,
          avatar: client.profileImage || "",
          status: client.isOnline ? "online" : "offline",
        });
      }
    }

    return participants;
  }
}