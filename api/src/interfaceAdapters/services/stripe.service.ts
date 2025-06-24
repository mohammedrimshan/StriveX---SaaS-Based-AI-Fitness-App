
import { injectable } from "tsyringe";
import Stripe from "stripe";
import { IStripeService } from "@/entities/services/stripe-service.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { HTTP_STATUS } from "@/shared/constants";

@injectable()
export class StripeService implements IStripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion:  "2025-03-31.basil",
    });
    console.log(`[${new Date().toISOString()}] Webhook secret loaded: ${process.env.STRIPE_WEBHOOK_SECRET ? 'present' : 'missing'}`);
  }

  async createConnectAccount(trainerId: string, email: string): Promise<string> {
    try {
      const account = await this.stripe.accounts.create({
        type: "express",
        email,
        metadata: { trainerId },
      });
      console.log(`[${new Date().toISOString()}] Created Stripe connect account: ${account.id} for trainerId: ${trainerId}`);
      return account.id;
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] Failed to create connect account: ${error.message}`);
      throw new CustomError("Failed to create connect account", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  async createCheckoutSession(
    clientId: string,
    plan: { id: string; price: number; name: string },
    successUrl: string,
    cancelUrl: string,
    metadata?: { clientId: string; planId: string; paymentId?: string; walletAppliedAmount?: string }
  ): Promise<{ url: string; sessionId: string }> {
    try {
      console.log(`[${new Date().toISOString()}] Creating checkout session with metadata: ${JSON.stringify(metadata)}`);
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: plan.name,
                metadata: { planId: plan.id, clientId },
              },
              unit_amount: Math.round(plan.price * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          clientId,
          planId: plan.id,
          paymentId: metadata?.paymentId || "",
          walletAppliedAmount: metadata?.walletAppliedAmount || "0",
          sessionId: "<will be set after creation>",
        },
        payment_intent_data: {
          metadata: {
            clientId,
            paymentId: metadata?.paymentId || "",
            planId: plan.id,
          },
        },
      });

      if (!session.url || !session.id) {
        console.error(`[${new Date().toISOString()}] Failed to create checkout session: missing url or id`);
        throw new CustomError("Failed to create checkout session", HTTP_STATUS.INTERNAL_SERVER_ERROR);
      }

      try {
        await this.stripe.checkout.sessions.update(session.id, {
          metadata: {
            clientId,
            planId: plan.id,
            paymentId: metadata?.paymentId || "",
            walletAppliedAmount: metadata?.walletAppliedAmount || "0",
            sessionId: session.id,
          },
        });
        console.log(`[${new Date().toISOString()}] Updated checkout session ${session.id} with metadata`);
      } catch (error: any) {
        console.error(`[${new Date().toISOString()}] Failed to update checkout session metadata: ${error.message}`);
        throw new CustomError("Failed to update checkout session metadata", HTTP_STATUS.INTERNAL_SERVER_ERROR);
      }

      return { url: session.url, sessionId: session.id };
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] Failed to create checkout session: ${error.message}`);
      throw new CustomError("Failed to create checkout session", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  async getCheckoutSessionByUrl(sessionId: string): Promise<Stripe.Checkout.Session> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      console.log(`[${new Date().toISOString()}] Retrieved checkout session: ${sessionId}`);
      return session;
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] Failed to retrieve checkout session: ${error.message}`);
      throw new CustomError("Failed to retrieve checkout session", HTTP_STATUS.BAD_REQUEST);
    }
  }

  async createTransfer(
    amount: number,
    stripeConnectId: string,
    paymentIntentId: string
  ): Promise<Stripe.Transfer> {
    try {
      const transfer = await this.stripe.transfers.create({
        amount: amount * 100,
        currency: "usd",
        destination: stripeConnectId,
        source_transaction: paymentIntentId,
      });
      console.log(`[${new Date().toISOString()}] Created transfer: ${transfer.id} for paymentIntentId: ${paymentIntentId}`);
      return transfer;
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] Failed to create transfer: ${error.message}`);
      throw new CustomError("Failed to create transfer", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  async getWebhookEvent(body: any, signature: string): Promise<Stripe.Event> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
      console.log(`[${new Date().toISOString()}] Webhook event constructed: ${event.id}`);
      return event;
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] Invalid webhook signature: ${error.message}`);
      throw new CustomError("Invalid webhook signature", HTTP_STATUS.BAD_REQUEST);
    }
  }

  async createAccountLink(
    accountId: string,
    refreshUrl: string,
    returnUrl: string
  ): Promise<string> {
    try {
      const accountLink = await this.stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: "account_onboarding",
      });
      console.log(`[${new Date().toISOString()}] Created account link for accountId: ${accountId}`);
      return accountLink.url;
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] Failed to create account link: ${error.message}`);
      throw new CustomError("Failed to create account link", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}
