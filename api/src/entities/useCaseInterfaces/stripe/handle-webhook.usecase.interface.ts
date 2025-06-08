import Stripe from "stripe";

export interface IHandleWebhookUseCase {
  execute(rawBody: Buffer, signature: string): Promise<void>;
}