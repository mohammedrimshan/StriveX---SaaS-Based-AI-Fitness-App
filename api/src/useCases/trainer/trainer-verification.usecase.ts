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
    private _trainerRepository: ITrainerRepository,
    @inject("IEmailService")
     private _emailService: IEmailService
  ) {}

  async execute(
    clientId: string,
    approvalStatus: TrainerApprovalStatus,
    rejectionReason?: string
  ): Promise<void> {
    const trainer = await this._trainerRepository.findById(clientId);

    if (!trainer) {
      throw new CustomError(
        ERROR_MESSAGES.USER_NOT_FOUND,
        HTTP_STATUS.NOT_FOUND
      );
    }

    if (trainer.approvalStatus !== TrainerApprovalStatus.PENDING) {
      throw new CustomError(
        ERROR_MESSAGES.TRAINER_ALREADY_APPROVED_OR_REJECTED,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (![TrainerApprovalStatus.APPROVED, TrainerApprovalStatus.REJECTED].includes(approvalStatus)) {
      throw new CustomError(
        ERROR_MESSAGES.INVALID_ACTION,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (approvalStatus === TrainerApprovalStatus.REJECTED && !rejectionReason) {
      throw new CustomError(
       ERROR_MESSAGES.REJECTION_REASON_REQUIRED,
        HTTP_STATUS.BAD_REQUEST
      );
    }

   
    const approvedByAdmin = approvalStatus === TrainerApprovalStatus.APPROVED ? true : false;

    await this._trainerRepository.updateApprovalStatus(
      clientId,
      approvalStatus,
      rejectionReason,
      approvedByAdmin
    );
    const trainerName = `${trainer.firstName} ${trainer.lastName}`;
    if (approvalStatus === TrainerApprovalStatus.APPROVED) {
      await this._emailService.sendEmail(
        trainer.email,
        "Your StriveX Trainer Application Has Been Approved",
        APPROVAL_MAIL_CONTENT(trainerName)
      );
    } else if (approvalStatus === TrainerApprovalStatus.REJECTED) {
      await this._emailService.sendEmail(
        trainer.email,
        "Update on Your StriveX Trainer Application",
        REJECTION_MAIL_CONTENT(trainerName, rejectionReason!)
      );
    }
  }
}