
import { inject, injectable } from "tsyringe";
import { IGetTrainerBackupInvitationsUseCase } from "@/entities/useCaseInterfaces/backtrainer/get-trainer-backup-invitations-usecase.interface";
import { IBackupTrainerInvitationRepository } from "@/entities/repositoryInterfaces/backuptrainerinvitation/backuptrainerinvitation.repository.interface";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { IBackupTrainerInvitationEntity } from "@/entities/models/backuptrainerinvitation.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS, ERROR_MESSAGES } from "@/shared/constants";

@injectable()
export class GetTrainerBackupInvitationsUseCase implements IGetTrainerBackupInvitationsUseCase {
  constructor(
    @inject("IBackupTrainerInvitationRepository") private invitationRepository: IBackupTrainerInvitationRepository,
    @inject("IClientRepository") private clientRepository: IClientRepository
  ) {}

  async execute(trainerId: string, skip: number, limit: number): Promise<{ items: IBackupTrainerInvitationEntity[]; total: number }> {
    const invitations = await this.invitationRepository.find({
      trainerId,
    }, skip, limit);

    console.log(invitations,"TOTAL INVITATION")

    // Enrich invitations with client details
    const enrichedItems = await Promise.all(
      invitations.items.map(async (invitation) => {
        const client = await this.clientRepository.findById(invitation.clientId);
        return {
          ...invitation,
          client: client ? {
            id: client.id,
            firstName: client.firstName,
            lastName: client.lastName,
            profileImage: client.profileImage,
            preferedWorkout:client.preferredWorkout,
            fitnessGoal:client.fitnessGoal,
            
          } : null
        };
      })
    );

    return {
      items: enrichedItems,
      total: invitations.total
    };
  }
}