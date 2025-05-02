import { container } from "tsyringe";
import slotExpiryQueue from "./slot-expiry.queue";
import { SlotExpiryProcessor } from "./slot-expiry.processor";

export const initializeSlotExpiryQueue = () => {
  console.log("Initializing slot expiry queue");
  const processor = container.resolve(SlotExpiryProcessor);
  slotExpiryQueue.process(async (job) => {
    await processor.process(job);
  });
};

export default slotExpiryQueue;