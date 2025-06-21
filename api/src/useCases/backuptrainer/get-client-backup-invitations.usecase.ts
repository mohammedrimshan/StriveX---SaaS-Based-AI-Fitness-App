
import { inject, injectable } from "tsyringe";
import { IGetClientBackupInvitationsUseCase } from "@/entities/useCaseInterfaces/backtrainer/get-client-backup-invitations-usecase.interface";
import { IBackupTrainerInvitationRepository } from "@/entities/repositoryInterfaces/backuptrainerinvitation/backuptrainerinvitation.repository.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { IBackupTrainerInvitationEntity } from "@/entities/models/backuptrainerinvitation.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS, ERROR_MESSAGES } from "@/shared/constants";

@injectable()
export class GetClientBackupInvitationsUseCase implements IGetClientBackupInvitationsUseCase {
  constructor(
    @inject("IBackupTrainerInvitationRepository") private invitationRepository: IBackupTrainerInvitationRepository,
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("ITrainerRepository") private trainerRepository: ITrainerRepository
  ) {}

  async execute(clientId: string, skip: number, limit: number): Promise<{ items: IBackupTrainerInvitationEntity[]; total: number }> {
    const client = await this.clientRepository.findById(clientId);
    if (!client) {
      throw new CustomError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const invitations = await this.invitationRepository.findByClientId(clientId);
    const total = invitations.length;
    const paginatedItems = invitations.slice(skip, skip + limit);

    // Enrich invitations with trainer details
    const enrichedItems = await Promise.all(
      paginatedItems.map(async (invitation) => {
        const trainer = await this.trainerRepository.findById(invitation.trainerId);
        return {
          ...invitation,
          trainer: trainer ? {
            id: trainer.id,
            firstName: trainer.firstName,
            lastName: trainer.lastName,
            profileImage: trainer.profileImage,
            specialization: trainer.specialization
          } : null
        };
      })
    );

    return { items: enrichedItems, total };
  }
}