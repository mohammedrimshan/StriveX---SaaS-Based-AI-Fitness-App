import { Job } from "bull";
import { inject, injectable } from "tsyringe";
import { ISlotRepository } from "../../../entities/repositoryInterfaces/slot/slot-repository.interface";
import { SessionHistoryModel } from "@/frameworks/database/mongoDB/models/session-history.model";
import { ISessionHistoryModel } from "@/frameworks/database/mongoDB/models/session-history.model";
import { SlotStatus, VideoCallStatus } from "@/shared/constants";
import { ClientModel } from "../../database/mongoDB/models/client.model";
import { TrainerModel } from "../../database/mongoDB/models/trainer.model";

@injectable()
export class SlotExpiryProcessor {
  constructor(
    @inject("ISlotRepository") private slotRepository: ISlotRepository
  ) {}

  async process(job: Job<{ slotId: string }>) {
    const { slotId } = job.data;
    const session = await SessionHistoryModel.startSession();
    session.startTransaction();
    try {
      let slot = await this.slotRepository.findById(slotId);
      if (!slot) {
        console.log(`Slot ${slotId} not found during expiry processing.`);
        await session.commitTransaction();
        return;
      }

      console.log(`Slot ${slotId} has expired and is scheduled for deletion by TTL.`);

      // If the slot is booked and the video call is in progress, end it
      if (slot.status === SlotStatus.BOOKED && slot.videoCallStatus === VideoCallStatus.IN_PROGRESS) {
        await this.slotRepository.updateVideoCallStatus(
          slotId,
          VideoCallStatus.ENDED,
        );
        console.log(`Automatically updated videoCallStatus to ENDED for slot ${slotId}`);
        // Refresh the slot data after updating
        slot = await this.slotRepository.findById(slotId);
        if (!slot) {
          console.error(`Slot ${slotId} not found after updating videoCallStatus.`);
          throw new Error("Slot not found after update");
        }
      }

      // Save to session history if the slot was booked
      if (slot.status === SlotStatus.BOOKED) {
        // Check for existing session history to prevent duplicates
        const existingHistory = await SessionHistoryModel.findOne({
          trainerId: slot.trainerId,
          clientId: slot.clientId,
          date: slot.date,
          startTime: slot.startTime,
        }).session(session);

        if (!existingHistory) {
          const trainer = await TrainerModel.findById(slot.trainerId)
            .select("firstName lastName")
            .lean()
            .session(session);
          const client = slot.clientId
            ? await ClientModel.findById(slot.clientId)
                .select("firstName lastName")
                .lean()
                .session(session)
            : null;

          const sessionHistoryData: Partial<ISessionHistoryModel> = {
            trainerId: slot.trainerId,
            trainerName: trainer
              ? `${trainer.firstName} ${trainer.lastName}`
              : slot.trainerName || "Unknown Trainer",
            clientId: slot.clientId,
            clientName: client
              ? `${client.firstName} ${client.lastName}`
              : slot.clientName || "Unknown Client",
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            status: slot.status,
            videoCallStatus: slot.videoCallStatus,
            bookedAt: slot.bookedAt,
            cancellationReason: slot.cancellationReason,
            createdAt: slot.createdAt,
            updatedAt: slot.updatedAt,
          };

          await SessionHistoryModel.create([sessionHistoryData], { session });
          console.log(`Session history saved for slot ${slotId} with videoCallStatus: ${sessionHistoryData.videoCallStatus}`);
        } else {
          console.log(`Session history already exists for slot ${slotId}`);
        }
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      console.error(`Error processing slot expiry for slot ${slotId}:`, error);
      throw error;
    } finally {
      session.endSession();
    }
  }
}