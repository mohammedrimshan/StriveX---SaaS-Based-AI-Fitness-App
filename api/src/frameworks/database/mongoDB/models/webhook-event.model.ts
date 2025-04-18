import { model } from "mongoose";
import { webhookEventSchema } from "../schemas/webhook-event.schema";

export const WebhookEventModel = model("WebhookEvent", webhookEventSchema);