import { Job } from "bull";
import { inject, injectable } from "tsyringe";
import { ISlotRepository } from "../../../entities/repositoryInterfaces/slot/slot-repository.interface";

@injectable()
export class SlotExpiryProcessor {
  constructor(
    @inject("ISlotRepository") private slotRepository: ISlotRepository
  ) {}

  async process(job: Job<{ slotId: string }>) {
    const { slotId } = job.data;
    const slot = await this.slotRepository.findById(slotId);
    if (slot) {
      console.log(`Slot ${slotId} has expired and is scheduled for deletion by TTL.`);
      // Additional logic (e.g., notifications) can be added here
    } else {
      console.log(`Slot ${slotId} not found during expiry processing.`);
    }
  }
}