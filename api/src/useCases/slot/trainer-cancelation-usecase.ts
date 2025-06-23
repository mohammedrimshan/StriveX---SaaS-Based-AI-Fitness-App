import { inject, injectable } from "tsyringe";
import { ISlotRepository } from "../../entities/repositoryInterfaces/slot/slot-repository.interface";
import { ICancellationRepository } from "../../entities/repositoryInterfaces/slot/cancellation.repository.interface";
import { ITrainerRepository } from "../../entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { IClientRepository } from "../../entities/repositoryInterfaces/client/client-repository.interface";
import { NotificationService } from "../../interfaceAdapters/services/notification.service";
import { ISlotEntity } from "../../entities/models/slot.entity";
import { CustomError } from "../../entities/utils/custom.error";
import { HTTP_STATUS, ERROR_MESSAGES } from "../../shared/constants";
import { ITrainerSlotCancellationUseCase } from "@/entities/useCaseInterfaces/slot/trainer-slot-cancellation-usecase.interface";
import { IReassignTrainerUseCase } from "@/entities/useCaseInterfaces/slot/reassign-trainer-usecase.interface";
import { ICancellationEntity } from "@/entities/models/cancellation.entity";

@injectable()
export class TrainerSlotCancellationUseCase implements ITrainerSlotCancellationUseCase {
  constructor(
    @inject("ISlotRepository") private slotRepository: ISlotRepository,
    @inject("ICancellationRepository") private cancellationRepository: ICancellationRepository,
    @inject("ITrainerRepository") private trainerRepository: ITrainerRepository,
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("NotificationService") private notificationService: NotificationService,
    @inject("IReassignTrainerUseCase") private reassignTrainerUseCase: IReassignTrainerUseCase
  ) {}

  async execute(
    trainerId: string,
    slotId: string,
    cancellationReason: string
  ): Promise<ISlotEntity> {
    // Step 1: Validate trainer
    const trainer = await this.trainerRepository.findById(trainerId);
    if (!trainer) {
      throw new CustomError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Step 2: Validate slot
    const slot = await this.slotRepository.findById(slotId);
    if (!slot || slot.trainerId.toString() !== trainerId) {
      throw new CustomError(ERROR_MESSAGES.SLOT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (!slot.isBooked || !slot.clientId) {
      throw new CustomError("Slot is not booked by a client", HTTP_STATUS.BAD_REQUEST);
    }

    // Step 3: Validate cancellation window (at least 30 minutes before start)
    const [year, month, day] = slot.date.split("-").map(Number);
    const [hours, minutes] = slot.startTime.split(":").map(Number);
    const slotStartTime = new Date(year, month - 1, day, hours, minutes);

    if (isNaN(slotStartTime.getTime())) {
      throw new CustomError(ERROR_MESSAGES.INVALID_SLOT_DATE_TIME, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    const cancellationThreshold = new Date(slotStartTime.getTime() - 30 * 60 * 1000);
    if (new Date() > cancellationThreshold) {
      throw new CustomError(ERROR_MESSAGES.CANNOT_CANCEL_WITHIN_30_MINUTES, HTTP_STATUS.BAD_REQUEST);
    }

    // Step 4: Validate cancellation reason
    if (!cancellationReason || cancellationReason.trim() === "") {
      throw new CustomError("Cancellation reason is required", HTTP_STATUS.BAD_REQUEST);
    }

    // Step 5: Attempt reassignment using injected use case
    try {
      const reassignedSlot = await this.reassignTrainerUseCase.execute(slotId, cancellationReason);
      
      // Save cancellation record
      const cancellationData: Partial<ICancellationEntity> = {
        slotId: slotId,
        clientId: slot.clientId,
        trainerId: trainerId,
        cancellationReason: cancellationReason,
        cancelledBy: "trainer", // Added cancelledBy field
        cancelledAt: new Date(),
      };
      await this.cancellationRepository.save(cancellationData);

      return reassignedSlot;
    } catch (error: any) {
      console.error("Reassignment failed:", error);
      throw new CustomError(
        `Failed to reassign or cancel slot: ${error.message || error}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}