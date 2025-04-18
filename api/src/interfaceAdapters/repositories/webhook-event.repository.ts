import { injectable } from "tsyringe";
import { IEventRepository } from "@/entities/repositoryInterfaces/ebhook-event-repository.interface";
import { WebhookEventModel } from "@/frameworks/database/mongoDB/models/webhook-event.model";

@injectable()
export class EventRepository implements IEventRepository {
  async isProcessed(eventId: string): Promise<boolean> {
    const event = await WebhookEventModel.findOne({ eventId }).lean();
    return !!event;
  }

  async markAsProcessed(eventId: string): Promise<void> {
    await WebhookEventModel.create({ eventId, processedAt: new Date() });
  }
}