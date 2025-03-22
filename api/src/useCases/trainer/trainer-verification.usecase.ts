// api\src\useCases\trainer\trainer-verification.usecase.ts
import { inject, injectable } from "tsyringe";
import { ERROR_MESSAGES, HTTP_STATUS } from "../../shared/constants";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { ITrainerVerificationUseCase } from "@/entities/useCaseInterfaces/admin/trainer-verification-usecase.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { TrainerApprovalStatus, APPROVAL_MAIL_CONTENT, REJECTION_MAIL_CONTENT } from "@/shared/constants";
import { IEmailService } from "@/entities/services/email-service.interface";


@injectable()
export class TrainerVerificationUseCase implements ITrainerVerificationUseCase {
  constructor(
    @inject("ITrainerRepository")
    private trainerRepository: ITrainerRepository,
    @inject("IEmailService")
     private emailService: IEmailService
  ) {}

  async execute(
    clientId: string,
    approvalStatus: TrainerApprovalStatus,
    rejectionReason?: string
  ): Promise<void> {
    const trainer = await this.trainerRepository.findById(clientId);

    if (!trainer) {
      throw new CustomError(
        ERROR_MESSAGES.USER_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }

    if (trainer.approvalStatus !== TrainerApprovalStatus.PENDING) {
      throw new CustomError(
        "Trainer has already been approved or rejected",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (![TrainerApprovalStatus.APPROVED, TrainerApprovalStatus.REJECTED].includes(approvalStatus)) {
      throw new CustomError(
        "Invalid approval status",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (approvalStatus === TrainerApprovalStatus.REJECTED && !rejectionReason) {
      throw new CustomError(
        "Rejection reason is required when rejecting a trainer",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Set approvedByAdmin to true if approving, false/undefined otherwise
    const approvedByAdmin = approvalStatus === TrainerApprovalStatus.APPROVED ? true : false;

    // Pass approvedByAdmin to the repository
    await this.trainerRepository.updateApprovalStatus(
      clientId,
      approvalStatus,
      rejectionReason,
      approvedByAdmin
    );
    const trainerName = `${trainer.firstName} ${trainer.lastName}`;
    if (approvalStatus === TrainerApprovalStatus.APPROVED) {
      await this.emailService.sendEmail(
        trainer.email,
        "Your StriveX Trainer Application Has Been Approved",
        APPROVAL_MAIL_CONTENT(trainerName)
      );
    } else if (approvalStatus === TrainerApprovalStatus.REJECTED) {
      await this.emailService.sendEmail(
        trainer.email,
        "Update on Your StriveX Trainer Application",
        REJECTION_MAIL_CONTENT(trainerName, rejectionReason!)
      );
    }
  }
}